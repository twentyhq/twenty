import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { TEAMS_ASSISTANT_INTERRUPTED_ERROR } from 'src/features/chat/logic-functions/constants/teams-assistant-interrupted-error';
import { TEAMS_ASSISTANT_INTERRUPTED_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-interrupted-failure-text';
import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { TEAMS_ASSISTANT_REQUEST_WATCHDOG_MAX_ATTEMPTS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-watchdog-max-attempts';
import { failStaleTeamsAssistantRequest } from 'src/features/chat/logic-functions/data/fail-stale-teams-assistant-request';
import { findTeamsAssistantRequestById } from 'src/features/chat/logic-functions/data/find-teams-assistant-request-by-id';
import { type TeamsAssistantRequestWatchdogPayload } from 'src/features/chat/logic-functions/types/teams-assistant-request-watchdog-payload.type';
import { type TeamsAssistantRequestWatchdogResult } from 'src/features/chat/logic-functions/types/teams-assistant-request-watchdog-result.type';
import { enqueueTeamsAssistantRequestWatchdog } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request-watchdog';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { isTeamsAssistantRequestStale } from 'src/features/chat/logic-functions/utils/is-teams-assistant-request-stale';
import { sendTeamsActivity } from 'src/features/chat/logic-functions/utils/send-teams-activity';

export const teamsAssistantRequestWatchdogHandler = async ({
  teamsAssistantRequestId,
  attempt = 1,
}: TeamsAssistantRequestWatchdogPayload): Promise<TeamsAssistantRequestWatchdogResult> => {
  const client = new CoreApiClient();

  const record = await findTeamsAssistantRequestById({
    client,
    id: teamsAssistantRequestId,
  });

  if (
    !isDefined(record) ||
    (record.status !== TEAMS_ASSISTANT_REQUEST_STATUS.PENDING &&
      record.status !== TEAMS_ASSISTANT_REQUEST_STATUS.PROCESSING)
  ) {
    return {
      failed: false,
      attempt,
      rescheduled: false,
      reason: 'Request is missing or already finished',
    };
  }

  const isStale = isTeamsAssistantRequestStale(record);

  if (!isStale && attempt >= TEAMS_ASSISTANT_REQUEST_WATCHDOG_MAX_ATTEMPTS) {
    return {
      failed: false,
      attempt,
      rescheduled: false,
      reason: 'Request is still being processed',
    };
  }

  if (!isStale) {
    await enqueueTeamsAssistantRequestWatchdog({
      teamsAssistantRequestId,
      attempt,
    });

    return { failed: false, attempt, rescheduled: true };
  }

  const isFailed = await failStaleTeamsAssistantRequest({
    client,
    id: teamsAssistantRequestId,
    errorMessage: TEAMS_ASSISTANT_INTERRUPTED_ERROR,
  });

  if (!isFailed) {
    return {
      failed: false,
      attempt,
      rescheduled: false,
      reason: 'Request was finished by another execution',
    };
  }

  const { teamsServiceUrl, teamsConversationId } = record;

  if (
    !isNonEmptyString(teamsServiceUrl) ||
    !isNonEmptyString(teamsConversationId)
  ) {
    return { failed: true, attempt, replied: false };
  }

  try {
    await sendTeamsActivity({
      serviceUrl: teamsServiceUrl,
      conversationId: teamsConversationId,
      accessToken: await getTeamsConnectorAccessTokenOrThrow(),
      activity: {
        type: 'message',
        text: TEAMS_ASSISTANT_INTERRUPTED_FAILURE_TEXT,
      },
    });
  } catch (error) {
    console.warn(
      `[teams] request ${teamsAssistantRequestId} was failed as interrupted but the reply could not be posted`,
      error,
    );

    return { failed: true, attempt, replied: false };
  }

  return { failed: true, attempt, replied: true };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER,
  name: 'teams-assistant-request-watchdog',
  description:
    'Enqueued with a delay for every Teams Assistant Request, past the answering function timeout. If the request is still pending or processing with no live execution behind it, marks it failed and tells the user to ask again. Never re-runs the agent.',
  timeoutSeconds: 30,
  handler: teamsAssistantRequestWatchdogHandler,
});
