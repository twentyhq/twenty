import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_ASSISTANT_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-failure-text';
import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { TEAMS_ASSISTANT_UNMATCHED_SENDER_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-unmatched-sender-text';
import { claimTeamsAssistantRequest } from 'src/features/chat/logic-functions/data/claim-teams-assistant-request';
import { updateTeamsAssistantRequest } from 'src/features/chat/logic-functions/data/update-teams-assistant-request';
import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';
import { type TeamsAssistantAnswerResult } from 'src/features/chat/logic-functions/types/teams-assistant-answer-result.type';
import { type TeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/types/teams-assistant-request-record.type';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { resolveTeamsSenderWorkspaceMemberId } from 'src/features/chat/logic-functions/utils/resolve-teams-sender-workspace-member-id';
import { runTeamsAssistantAgentOrThrow } from 'src/features/chat/logic-functions/utils/run-teams-assistant-agent-or-throw';
import { sendTeamsActivity } from 'src/features/chat/logic-functions/utils/send-teams-activity';
import { toErrorMessage } from 'src/utils/to-error-message';

export const answerTeamsAssistantRequest = async ({
  request,
  agentDeadlineAtMs,
}: {
  request: TeamsAssistantRequestRecord;
  agentDeadlineAtMs: number;
}): Promise<TeamsAssistantAnswerResult> => {
  const {
    teamsServiceUrl,
    teamsConversationId,
    teamsUserId,
    teamsTenantId,
    requestText,
  } = request;

  if (
    !isNonEmptyString(teamsServiceUrl) ||
    !isNonEmptyString(teamsConversationId) ||
    !isNonEmptyString(teamsUserId) ||
    !isNonEmptyString(teamsTenantId) ||
    !isNonEmptyString(requestText)
  ) {
    return { status: 'skipped', reason: 'Request record is missing fields' };
  }

  const client = new CoreApiClient();

  if (!(await claimTeamsAssistantRequest({ client, id: request.id }))) {
    return { status: 'skipped', reason: 'Request is already being processed' };
  }

  const sendActivity = async (activity: TeamsActivity) =>
    sendTeamsActivity({
      serviceUrl: teamsServiceUrl,
      conversationId: teamsConversationId,
      accessToken: await getTeamsConnectorAccessTokenOrThrow(),
      activity,
    });

  try {
    await sendActivity({ type: 'typing' }).catch(() => undefined);

    const workspaceMemberId = await resolveTeamsSenderWorkspaceMemberId({
      client,
      serviceUrl: teamsServiceUrl,
      conversationId: teamsConversationId,
      teamsUserId,
      teamsTenantId,
      accessToken: await getTeamsConnectorAccessTokenOrThrow(),
    });

    if (!isDefined(workspaceMemberId)) {
      await sendActivity({
        type: 'message',
        text: TEAMS_ASSISTANT_UNMATCHED_SENDER_TEXT,
      });
      await updateTeamsAssistantRequest({
        client,
        id: request.id,
        status: TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
        responseText: TEAMS_ASSISTANT_UNMATCHED_SENDER_TEXT,
      }).catch(() => undefined);

      return { status: 'declined', reason: 'Sender is not a workspace member' };
    }

    await updateTeamsAssistantRequest({
      client,
      id: request.id,
      workspaceMemberId,
    });

    const responseText = await runTeamsAssistantAgentOrThrow({
      requestText,
      workspaceMemberId,
      deadlineAtMs: agentDeadlineAtMs,
    });

    await sendActivity({ type: 'message', text: responseText });
    await updateTeamsAssistantRequest({
      client,
      id: request.id,
      status: TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
      responseText,
    }).catch(() => undefined);

    return { status: 'answered' };
  } catch (error) {
    const errorMessage = toErrorMessage(error);

    await sendActivity({
      type: 'message',
      text: TEAMS_ASSISTANT_FAILURE_TEXT,
    }).catch(() => undefined);
    await updateTeamsAssistantRequest({
      client,
      id: request.id,
      status: TEAMS_ASSISTANT_REQUEST_STATUS.FAILED,
      errorMessage,
    }).catch(() => undefined);

    return { status: 'failed', reason: errorMessage };
  }
};
