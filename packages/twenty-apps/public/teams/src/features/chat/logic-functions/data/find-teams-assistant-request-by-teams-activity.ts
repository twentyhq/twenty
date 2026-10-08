import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/types/teams-assistant-request-record.type';

export const findTeamsAssistantRequestByTeamsActivity = async ({
  client,
  teamsConversationId,
  teamsActivityId,
}: {
  client: CoreApiClient;
  teamsConversationId: string;
  teamsActivityId: string;
}): Promise<TeamsAssistantRequestRecord | undefined> => {
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
          requestText: { markdown: true },
          updatedAt: true,
        },
      },
    },
  });

  const node = queryResult.teamsAssistantRequests?.edges?.[0]?.node;

  if (!isDefined(node)) {
    return undefined;
  }

  return { ...node, requestText: node.requestText?.markdown ?? undefined };
};
