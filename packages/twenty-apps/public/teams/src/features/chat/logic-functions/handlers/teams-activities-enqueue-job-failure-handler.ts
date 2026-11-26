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

const UNFINISHED_STATUSES: string[] = [
  TEAMS_ASSISTANT_REQUEST_STATUS.PENDING,
  TEAMS_ASSISTANT_REQUEST_STATUS.PROCESSING,
];

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

  if (!UNFINISHED_STATUSES.includes(request.status ?? '')) {
    return { skipped: true, reason: 'Request is already finished' };
  }

  await sendTeamsReplyOnce({
    kvKey: `teams-job-failure-reply:${request.id}`,
    ttlMs: TEAMS_JOB_FAILURE_REPLY_TTL_MS,
    serviceUrl: teamsServiceUrl,
    conversationId: teamsConversationId,
    text: TEAMS_ASSISTANT_FAILURE_TEXT,
  });

  await updateTeamsAssistantRequest({
    client,
    id: request.id,
    status: TEAMS_ASSISTANT_REQUEST_STATUS.FAILED,
    errorMessage: `${error.type}: ${error.message}`,
  });

  return { failed: true };
};
