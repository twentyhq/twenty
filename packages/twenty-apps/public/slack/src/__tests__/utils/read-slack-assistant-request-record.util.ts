import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestRecordFields } from 'src/__tests__/types/slack-assistant-request-record-fields.type';
import { requireDefinedOrThrow } from 'src/__tests__/utils/require-defined-or-throw.util';

export const readSlackAssistantRequestRecord = async ({
  coreClient,
  id,
}: {
  coreClient: CoreApiClient;
  id: string;
}): Promise<SlackAssistantRequestRecordFields> => {
  const queryResult = await coreClient.query({
    slackAssistantRequest: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      status: true,
      requestText: true,
      responseText: true,
      errorMessage: true,
      agentChatThreadId: true,
    },
  });

  return requireDefinedOrThrow(
    queryResult.slackAssistantRequest,
    'The Slack Assistant Request was not returned by the Twenty API',
  );
};
