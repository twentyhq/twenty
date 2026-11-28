import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/types/teams-assistant-request-record.type';

export const findTeamsAssistantRequestByAnswerActivity = async ({
  client,
  teamsConversationId,
  teamsAnswerActivityId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  teamsConversationId: string;
  teamsAnswerActivityId: string;
}): Promise<
  Pick<TeamsAssistantRequestRecord, 'id' | 'teamsUserId'> | undefined
> => {
  const queryResult = await client.query({
    teamsAssistantRequests: {
      __args: {
        filter: {
          teamsConversationId: { eq: teamsConversationId },
          teamsAnswerActivityId: { eq: teamsAnswerActivityId },
        },
        first: 1,
      },
      edges: { node: { id: true, teamsUserId: true } },
    },
  });

  return queryResult.teamsAssistantRequests?.edges?.[0]?.node ?? undefined;
};
