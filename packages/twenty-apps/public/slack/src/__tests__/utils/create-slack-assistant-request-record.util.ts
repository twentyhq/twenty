import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestRecordDraft } from 'src/__tests__/types/slack-assistant-request-record-draft.type';
import { requireDefinedOrThrow } from 'src/__tests__/utils/require-defined-or-throw.util';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';

export const createSlackAssistantRequestRecord = async ({
  coreClient,
  draft,
}: {
  coreClient: CoreApiClient;
  draft: SlackAssistantRequestRecordDraft;
}): Promise<{ id: string }> => {
  const mutationResult = await coreClient.mutation({
    createSlackAssistantRequest: {
      __args: {
        data: {
          name: draft.requestText,
          status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
          slackChannelType: 'channel',
          slackThreadTimestamp: '',
          slackEventId: `Ev${draft.slackMessageTimestamp}`,
          createdBy: {
            source: 'APPLICATION',
            workspaceMemberId: null,
            name: 'Slack',
          },
          ...draft,
        },
      },
      id: true,
    },
  });

  return requireDefinedOrThrow(
    mutationResult.createSlackAssistantRequest,
    'The created Slack Assistant Request was not returned by the Twenty API',
  );
};
