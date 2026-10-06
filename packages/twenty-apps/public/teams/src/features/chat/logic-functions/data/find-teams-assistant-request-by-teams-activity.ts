import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/types/teams-assistant-request-record.type';

export const findTeamsAssistantRequestByTeamsActivity = async (
  client: CoreApiClient,
  {
    teamsConversationId,
    teamsActivityId,
  }: { teamsConversationId: string; teamsActivityId: string },
): Promise<TeamsAssistantRequestRecord | undefined> => {
  const queryResult = await client.query({
    teamsAssistantRequests: {
      __args: {
        filter: {
          teamsConversationId: { eq: teamsConversationId },
          teamsActivityId: { eq: teamsActivityId },
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          status: true,
          teamsActivityId: true,
          teamsConversationId: true,
          teamsConversationType: true,
          teamsServiceUrl: true,
          teamsTenantId: true,
          teamsUserId: true,
          teamsUserAadObjectId: true,
          requestText: true,
          updatedAt: true,
        },
      },
    },
  });

  return queryResult.teamsAssistantRequests?.edges?.[0]?.node ?? undefined;
};
