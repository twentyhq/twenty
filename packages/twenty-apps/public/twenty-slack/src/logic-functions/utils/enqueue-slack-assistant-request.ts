import { CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_CHANNEL_MODE } from 'src/logic-functions/constants/slack-channel-mode';
import { createSlackAssistantRequest } from 'src/logic-functions/data/create-slack-assistant-request';
import { findSlackAssistantRequestBySlackMessage } from 'src/logic-functions/data/find-slack-assistant-request-by-slack-message';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { isSlackThreadActive } from 'src/logic-functions/utils/is-slack-thread-active';
import { isSlackUserMappingRequired } from 'src/logic-functions/utils/is-slack-user-mapping-required';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';
import { postSlackAccountLinkPrompt } from 'src/logic-functions/utils/post-slack-account-link-prompt';
import { resolveSlackChannelMode } from 'src/logic-functions/utils/resolve-slack-channel-mode';
import { resolveSlackUserLink } from 'src/logic-functions/utils/resolve-slack-user-link';

type SlackEventsEnqueueResult = { ok: boolean; skipped?: string };

export const enqueueSlackAssistantRequest = async (
  body: SlackEventsRequestBody,
): Promise<SlackEventsEnqueueResult> => {
  const parsed = parseSlackAssistantRequest(body);

  if (parsed.request === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  const client = new CoreApiClient();

  const channelMode = await resolveSlackChannelMode(client, {
    slackChannelId: parsed.request.slackChannelId,
  });

  if (channelMode === SLACK_CHANNEL_MODE.SILENT) {
    return { ok: true, skipped: 'Channel rule is silent' };
  }

  if (parsed.requiresActiveThreadSubscription) {
    const isActive = await isSlackThreadActive({
      channelId: parsed.request.slackChannelId,
      threadTimestamp: parsed.request.slackThreadTimestamp,
    });

    if (!isActive) {
      return {
        ok: true,
        skipped: 'Thread is not subscribed for unmentioned follow-ups',
      };
    }
  }

  const existingRequestId = await findSlackAssistantRequestBySlackMessage(
    client,
    {
      slackChannelId: parsed.request.slackChannelId,
      slackMessageTimestamp: parsed.request.slackMessageTimestamp,
    },
  );

  if (existingRequestId !== undefined) {
    return { ok: true, skipped: 'Slack message is already queued' };
  }

  // Resolving here rather than in the worker is what creates the link on first
  // contact; the worker then only reads it back.
  const userLink = await resolveSlackUserLink(client, {
    slackUserId: parsed.request.slackUserId,
  });

  if (userLink === undefined && isSlackUserMappingRequired()) {
    await postSlackAccountLinkPrompt({
      slackChannelId: parsed.request.slackChannelId,
      slackUserId: parsed.request.slackUserId,
    });

    return {
      ok: true,
      skipped: 'Slack user is not linked to a workspace member',
    };
  }

  await createSlackAssistantRequest(client, parsed.request);

  return { ok: true };
};
