import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TEAMS_ASSISTANT_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-failure-text';
import { TEAMS_ASSISTANT_HISTORY_TURN_LIMIT } from 'src/features/chat/logic-functions/constants/teams-assistant-history-turn-limit';
import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { type TeamsAssistantTurn } from 'src/features/chat/logic-functions/types/teams-assistant-turn.type';

export const findTeamsAssistantHistory = async ({
  client,
  teamsConversationId,
  workspaceMemberId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  teamsConversationId: string;
  workspaceMemberId: string;
}): Promise<TeamsAssistantTurn[]> => {
  const queryResult = await client.query({
    teamsAssistantRequests: {
      __args: {
        filter: {
          teamsConversationId: { eq: teamsConversationId },
          workspaceMemberId: { eq: workspaceMemberId },
          status: {
            in: [
              TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
              TEAMS_ASSISTANT_REQUEST_STATUS.FAILED,
            ],
          },
        },
        orderBy: [{ createdAt: 'DescNullsLast' }],
        first: TEAMS_ASSISTANT_HISTORY_TURN_LIMIT,
      },
      edges: {
        node: {
          status: true,
          requestText: { markdown: true },
          responseText: { markdown: true },
        },
      },
    },
  });

  const history: TeamsAssistantTurn[] = [];

  for (const { node } of queryResult.teamsAssistantRequests?.edges ?? []) {
    const requestText = node.requestText?.markdown;
    const responseText =
      node.status === TEAMS_ASSISTANT_REQUEST_STATUS.FAILED
        ? TEAMS_ASSISTANT_FAILURE_TEXT
        : node.responseText?.markdown;

    if (isNonEmptyString(requestText) && isNonEmptyString(responseText)) {
      history.unshift({ requestText, responseText });
    }
  }

  return history;
};
