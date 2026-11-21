import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/types/teams-assistant-request-record.type';

export const findTeamsAssistantRequestById = async ({
  client,
  id,
}: {
  client: Pick<CoreApiClient, 'query'>;
  id: string;
}): Promise<
  | Pick<
      TeamsAssistantRequestRecord,
      'id' | 'status' | 'teamsConversationId' | 'teamsServiceUrl' | 'updatedAt'
    >
  | undefined
> => {
  const queryResult = await client.query({
    teamsAssistantRequests: {
      __args: { filter: { id: { eq: id } }, first: 1 },
      edges: {
        node: {
          id: true,
          status: true,
          teamsConversationId: true,
          teamsServiceUrl: true,
          updatedAt: true,
        },
      },
    },
  });

  return queryResult.teamsAssistantRequests?.edges?.[0]?.node ?? undefined;
};
