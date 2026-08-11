import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestCreatedBy } from 'src/logic-functions/types/slack-assistant-request-created-by.type';

export const findSlackAssistantRequestCreatedBy = async (
  client: CoreApiClient,
  requestId: string,
): Promise<SlackAssistantRequestCreatedBy | undefined> => {
  const queryResult = await client.query({
    slackAssistantRequest: {
      __args: { filter: { id: { eq: requestId } } },
      createdBy: { source: true, workspaceMemberId: true },
    },
  });

  const createdBy = queryResult.slackAssistantRequest?.createdBy;

  return createdBy ?? undefined;
};
