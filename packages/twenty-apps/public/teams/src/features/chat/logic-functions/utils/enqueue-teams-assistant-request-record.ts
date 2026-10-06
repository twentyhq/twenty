import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { createTeamsAssistantRequest } from 'src/features/chat/logic-functions/data/create-teams-assistant-request';
import { findTeamsAssistantRequestByTeamsActivity } from 'src/features/chat/logic-functions/data/find-teams-assistant-request-by-teams-activity';
import { type TeamsActivitiesEnqueueResult } from 'src/features/chat/logic-functions/types/teams-activities-enqueue-result.type';
import { type TeamsAssistantRequestDraft } from 'src/features/chat/logic-functions/types/teams-assistant-request-draft.type';
import { type TeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/types/teams-assistant-request-record.type';
import { isDuplicateRecordError } from 'src/features/chat/logic-functions/utils/is-duplicate-record-error';
import { isTeamsAssistantRequestResumable } from 'src/features/chat/logic-functions/utils/is-teams-assistant-request-resumable';

const ALREADY_QUEUED_SKIP_REASON = 'Teams activity is already queued';

const resolveExistingRequest = (
  existingRequest: TeamsAssistantRequestRecord | undefined,
): TeamsActivitiesEnqueueResult =>
  isDefined(existingRequest) &&
  isTeamsAssistantRequestResumable(existingRequest)
    ? { ok: true, request: existingRequest }
    : { ok: true, skipped: ALREADY_QUEUED_SKIP_REASON };

export const enqueueTeamsAssistantRequestRecord = async (
  request: TeamsAssistantRequestDraft,
): Promise<TeamsActivitiesEnqueueResult> => {
  const client = new CoreApiClient();
  const teamsActivityKey = {
    teamsConversationId: request.teamsConversationId,
    teamsActivityId: request.teamsActivityId,
  };

  const existingRequest = await findTeamsAssistantRequestByTeamsActivity(
    client,
    teamsActivityKey,
  );

  if (isDefined(existingRequest)) {
    return resolveExistingRequest(existingRequest);
  }

  try {
    const requestId = await createTeamsAssistantRequest(client, request);

    return {
      ok: true,
      request: {
        id: requestId,
        status: TEAMS_ASSISTANT_REQUEST_STATUS.PENDING,
        ...request,
      },
    };
  } catch (error) {
    if (isDuplicateRecordError(error)) {
      return resolveExistingRequest(
        await findTeamsAssistantRequestByTeamsActivity(
          client,
          teamsActivityKey,
        ),
      );
    }

    throw error;
  }
};
