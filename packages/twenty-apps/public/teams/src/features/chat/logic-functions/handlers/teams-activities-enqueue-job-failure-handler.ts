import { CoreApiClient } from 'twenty-client-sdk/core';
import { type LogicFunctionJobFailure } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_ASSISTANT_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-failure-text';
import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { findTeamsAssistantRequestByTeamsActivity } from 'src/features/chat/logic-functions/data/find-teams-assistant-request-by-teams-activity';
import { updateTeamsAssistantRequest } from 'src/features/chat/logic-functions/data/update-teams-assistant-request';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { parseTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/parse-teams-assistant-request';
import { sendTeamsReplyOnce } from 'src/features/chat/logic-functions/utils/send-teams-reply-once';

const TEAMS_JOB_FAILURE_REPLY_TTL_MS = 60 * 60 * 1000;

export const teamsActivitiesEnqueueJobFailureHandler = async ({
  payload,
  error,
}: LogicFunctionJobFailure<TeamsActivitiesDispatchPayload>): Promise<object> => {
  const parsed = parseTeamsAssistantRequest(payload);

  if (parsed.request === null) {
    return { skipped: true, reason: parsed.skipReason };
  }

  const { teamsConversationId, teamsActivityId, teamsServiceUrl } =
    parsed.request;

  const client = new CoreApiClient();

  const request = await findTeamsAssistantRequestByTeamsActivity({
    client,
    teamsConversationId,
    teamsActivityId,
  });

  if (!isDefined(request)) {
    return { skipped: true, reason: 'Request was never recorded' };
  }

  const isUnfinished =
    request.status === TEAMS_ASSISTANT_REQUEST_STATUS.PENDING ||
    request.status === TEAMS_ASSISTANT_REQUEST_STATUS.PROCESSING;

  if (!isUnfinished) {
    return { skipped: true, reason: 'Request is already finished' };
  }

  const errorMessage = `${error.type}: ${error.message}`;

  // A throw here is final (onJobFailure is not retried), so a failed reply must not leave the request PROCESSING.
  await sendTeamsReplyOnce({
    kvKey: `teams-job-failure-reply:${request.id}`,
    ttlMs: TEAMS_JOB_FAILURE_REPLY_TTL_MS,
    serviceUrl: teamsServiceUrl,
    conversationId: teamsConversationId,
    text: TEAMS_ASSISTANT_FAILURE_TEXT,
  }).catch((replyError: unknown) => {
    console.warn(
      `[teams] could not post the job failure reply of request ${request.id}`,
      replyError,
    );
  });

  await updateTeamsAssistantRequest({
    client,
    id: request.id,
    status: TEAMS_ASSISTANT_REQUEST_STATUS.FAILED,
    errorMessage,
  });

  return { failed: true, reason: errorMessage };
};
