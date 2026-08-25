import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ACCESS_DENIED_TEXT } from 'src/logic-functions/constants/slack-access-denied-text';
import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';
import { SLACK_ASSISTANT_AGENT_BUDGET_SECONDS } from 'src/logic-functions/constants/slack-assistant-agent-budget-seconds';
import { SLACK_ASSISTANT_EMPTY_RESPONSE_ERROR } from 'src/logic-functions/constants/slack-assistant-empty-response-error';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { claimSlackAssistantRequest } from 'src/logic-functions/data/claim-slack-assistant-request';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';
import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { buildSlackAssistantAnswerBlocks } from 'src/logic-functions/utils/build-slack-assistant-answer-blocks';
import { buildSlackAssistantMessages } from 'src/logic-functions/utils/build-slack-assistant-messages';
import { buildSlackAnswerDeliveryFailureMessage } from 'src/logic-functions/utils/build-slack-answer-delivery-failure-message';
import { buildSlackAssistantRequestName } from 'src/logic-functions/utils/build-slack-assistant-request-name';
import { enqueueSlackMessageDelivery } from 'src/logic-functions/utils/enqueue-slack-message-delivery';
import { extractAgentResponseText } from 'src/logic-functions/utils/extract-agent-response-text';
import { fetchSlackAssistantContext } from 'src/logic-functions/utils/fetch-slack-assistant-context';
import { fetchWorkspaceBaseUrls } from 'src/logic-functions/utils/fetch-workspace-base-urls';
import { isSlackAssistantRequestResumable } from 'src/logic-functions/utils/is-slack-assistant-request-resumable';
import { finishSlackAssistantRequestWithFailure } from 'src/logic-functions/utils/finish-slack-assistant-request-with-failure';
import { getSlackAccessMode } from 'src/logic-functions/utils/get-slack-access-mode';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';
import { resolveSlackAssistantMentions } from 'src/logic-functions/utils/resolve-slack-assistant-mentions';
import { resolveSlackRunAsForRequest } from 'src/logic-functions/utils/resolve-slack-run-as-for-request';
import { runSlackAssistantAgentWithDeadline } from 'src/logic-functions/utils/run-slack-assistant-agent-with-deadline';
import { sendSlackMessage } from 'src/logic-functions/utils/send-slack-message';
import { setSlackAssistantThreadTitle } from 'src/logic-functions/utils/set-slack-assistant-thread-title';
import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';
import { subscribeSlackThread } from 'src/logic-functions/utils/subscribe-slack-thread';

export const slackAssistantWorkerHandler = async (
  record: SlackAssistantRequestRecord,
  {
    agentDeadlineAtMs = Date.now() +
      SLACK_ASSISTANT_AGENT_BUDGET_SECONDS * 1000,
  }: { agentDeadlineAtMs?: number } = {},
): Promise<object> => {
  if (!isSlackAssistantRequestResumable(record)) {
    return { skipped: true, reason: 'Request is not pending' };
  }

  const { slackChannelId, slackMessageTimestamp, requestText } = record;

  if (
    !isNonEmptyString(slackChannelId) ||
    !isNonEmptyString(slackMessageTimestamp) ||
    !isNonEmptyString(requestText)
  ) {
    return { skipped: true, reason: 'Request record is missing fields' };
  }

  const client = new CoreApiClient();

  const isClaimed = await claimSlackAssistantRequest(client, { id: record.id });

  if (!isClaimed) {
    return { skipped: true, reason: 'Request is already being processed' };
  }

  const isThreadStartingMessage = !isNonEmptyString(
    record.slackThreadTimestamp,
  );

  const parentMessageTimestamp = getSlackAssistantParentMessageTimestamp({
    slackThreadTimestamp: record.slackThreadTimestamp,
    slackMessageTimestamp,
  });

  const failureContext = {
    client,
    requestId: record.id,
    slackChannelId,
    parentMessageTimestamp,
  };

  const stopStatusUpdates = startSlackAssistantStatusUpdates({
    slackChannelId,
    threadTimestamp: parentMessageTimestamp,
  });

  try {
    const [
      {
        conversationMessages,
        sharedFileNames,
        requesterName,
        requesterIdentity,
        requestMessage,
        threadMessages,
        slackClient,
        assistantBotUserId,
        isDirectMessage,
      },
      workspaceBaseUrls,
    ] = await Promise.all([
      fetchSlackAssistantContext({
        slackChannelId,
        parentMessageTimestamp,
        slackMessageTimestamp,
        slackUserId: record.slackUserId,
      }),
      fetchWorkspaceBaseUrls(),
    ]);

    const runAsWorkspaceMemberId = await resolveSlackRunAsForRequest({
      client,
      slackClient,
      assistantBotUserId,
      identity: requesterIdentity,
      requestId: record.id,
      requestText,
      requestMessage,
      threadMessages,
      isDirectMessage,
    });

    if (isNonEmptyString(runAsWorkspaceMemberId)) {
      await updateSlackAssistantRequest(client, {
        id: record.id,
        workspaceMemberId: runAsWorkspaceMemberId,
      }).catch(() => undefined);
    }

    const accessMode = await getSlackAccessMode();

    if (
      accessMode === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS &&
      !isNonEmptyString(runAsWorkspaceMemberId)
    ) {
      await stopStatusUpdates();

      await sendSlackMessage({
        slackChannelId,
        messageText: SLACK_ACCESS_DENIED_TEXT,
        parentMessageTimestamp,
        messageFormat: 'markdown',
        unfurlLinks: false,
        unfurlMedia: false,
      });

      await updateSlackAssistantRequest(client, {
        id: record.id,
        status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
        responseText: SLACK_ACCESS_DENIED_TEXT,
      });

      return { done: true, declined: true };
    }

    const resolvedMentions = await resolveSlackAssistantMentions({
      requestText,
      conversationMessages,
      client,
      slackClient,
      assistantBotUserId,
    });

    const agentBudgetRemainingSeconds = Math.max(
      Math.ceil((agentDeadlineAtMs - Date.now()) / 1000),
      0,
    );

    const agentResult = await runSlackAssistantAgentWithDeadline({
      agentUniversalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
      runAsWorkspaceMemberId,
      messages: buildSlackAssistantMessages({
        requestText: resolvedMentions.requestText,
        requesterName,
        conversationMessages: resolvedMentions.conversationMessages,
        runAsWorkspaceMemberId,
        timeoutSeconds: agentBudgetRemainingSeconds,
        workspaceBaseUrl: workspaceBaseUrls[0],
        hasMentionedUsers: resolvedMentions.hasMentionedUsers,
        sharedFileNames,
      }),
      deadlineAtMs: agentDeadlineAtMs,
    }).finally(() => stopStatusUpdates());

    if (!agentResult.success) {
      return await finishSlackAssistantRequestWithFailure({
        ...failureContext,
        errorMessage: agentResult.error ?? 'Agent execution failed',
      });
    }

    const responseText = extractAgentResponseText(agentResult);

    if (responseText === undefined) {
      return await finishSlackAssistantRequestWithFailure({
        ...failureContext,
        errorMessage: SLACK_ASSISTANT_EMPTY_RESPONSE_ERROR,
      });
    }

    const answerMessage: SlackPostMessageInput = {
      slackChannelId,
      messageText: responseText,
      parentMessageTimestamp,
      messageFormat: 'markdown',
      unfurlLinks: false,
      unfurlMedia: false,
      messageBlocks: buildSlackAssistantAnswerBlocks({
        responseText,
        requestId: record.id,
        workspaceBaseUrl: workspaceBaseUrls[0],
      }),
    };

    const deliveryResult = await sendSlackMessage(answerMessage, {
      waitOutRateLimit: false,
    });

    const deferredRetryAfterSeconds = deliveryResult.success
      ? undefined
      : deliveryResult.retryAfterSeconds;

    if (!deliveryResult.success && !isDefined(deferredRetryAfterSeconds)) {
      return await finishSlackAssistantRequestWithFailure({
        ...failureContext,
        errorMessage: buildSlackAnswerDeliveryFailureMessage(deliveryResult),
      });
    }

    if (isDefined(deferredRetryAfterSeconds)) {
      await enqueueSlackMessageDelivery({
        payload: { ...answerMessage, slackAssistantRequestId: record.id },
        retryAfterSeconds: deferredRetryAfterSeconds,
      });
    } else {
      await updateSlackAssistantRequest(client, {
        id: record.id,
        status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
        responseText,
      });
    }

    if (isDirectMessage) {
      if (isThreadStartingMessage) {
        await setSlackAssistantThreadTitle({
          slackChannelId,
          threadTimestamp: parentMessageTimestamp,
          title: buildSlackAssistantRequestName(requestText),
        });
      }
    } else {
      await subscribeSlackThread({
        channelId: slackChannelId,
        threadTimestamp: parentMessageTimestamp,
      }).catch(() => undefined);
    }

    return isDefined(deferredRetryAfterSeconds)
      ? { deferred: true }
      : { done: true };
  } catch (error) {
    await stopStatusUpdates();

    return await finishSlackAssistantRequestWithFailure({
      ...failureContext,
      errorMessage:
        error instanceof Error ? error.message : 'Unexpected worker error',
    });
  }
};
