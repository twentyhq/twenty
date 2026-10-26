import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

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
          status: { eq: TEAMS_ASSISTANT_REQUEST_STATUS.DONE },
        },
        orderBy: [{ createdAt: 'DescNullsLast' }],
        first: TEAMS_ASSISTANT_HISTORY_TURN_LIMIT,
      },
      edges: {
        node: {
          requestText: { markdown: true },
          responseText: { markdown: true },
        },
      },
    },
  });

  const history: TeamsAssistantTurn[] = [];

  for (const { node } of queryResult.teamsAssistantRequests?.edges ?? []) {
    const requestText = node.requestText?.markdown;
    const responseText = node.responseText?.markdown;

    if (isNonEmptyString(requestText) && isNonEmptyString(responseText)) {
      history.unshift({ requestText, responseText });
    }
  }

  return history;
};
