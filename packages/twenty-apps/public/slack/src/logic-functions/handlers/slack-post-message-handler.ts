import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { type SlackRecordPreviewScope } from 'src/logic-functions/types/slack-record-preview-scope.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { postSlackMessage } from 'src/logic-functions/utils/post-slack-message';

// Posts as the app does for a tool call, but with a say in whose permissions
// the record previews on the message are fetched with.
export const postSlackMessageWithPreviewScope = async ({
  parameters,
  recordPreviewScope,
}: {
  parameters: SlackPostMessageInput;
  recordPreviewScope: SlackRecordPreviewScope;
}): Promise<SlackToolResult> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  return await postSlackMessage(slackClientResult.client, parameters, {
    recordPreviewScope,
  });
};

export const slackPostMessageHandler = async (
  parameters: SlackPostMessageInput,
): Promise<SlackToolResult> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  return await postSlackMessage(slackClientResult.client, parameters);
};
