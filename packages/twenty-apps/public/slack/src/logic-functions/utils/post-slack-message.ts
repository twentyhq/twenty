import { type EntityMetadata, type WebClient } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { buildSlackRecordEntitiesForMessage } from 'src/logic-functions/utils/build-slack-record-entities-for-message';
import { getSlackApiErrorCode } from 'src/logic-functions/utils/get-slack-api-error-code';
import { isSlackMetadataError } from 'src/logic-functions/utils/is-slack-metadata-error';
import { normalizeSlackParentMessageTimestamp } from 'src/logic-functions/utils/normalize-slack-parent-message-timestamp';
import { sendSlackMessageWithBodyFallbacks } from 'src/logic-functions/utils/send-slack-message-with-body-fallbacks';

export const postSlackMessage = async (
  client: WebClient,
  parameters: SlackPostMessageInput,
): Promise<SlackToolResult> => {
  const parentTimestamp = normalizeSlackParentMessageTimestamp(
    parameters.parentMessageTimestamp,
  );

  const recordEntities = await buildSlackRecordEntitiesForMessage(
    parameters.messageText,
  );

  let lastErrorCode: string | undefined;

  const post = async (entities: EntityMetadata[]): Promise<SlackToolResult> =>
    await sendSlackMessageWithBodyFallbacks({
      messageText: parameters.messageText,
      messageBody: {
        messageFormat: parameters.messageFormat,
        messageBlocks: parameters.messageBlocks,
      },
      failureMessage: 'Failed to post Slack message',
      sendMessage: async (bodyFields) => {
        try {
          const data = await client.chat.postMessage({
            channel: parameters.slackChannelId,
            thread_ts: parentTimestamp,
            ...(isDefined(parameters.unfurlLinks)
              ? { unfurl_links: parameters.unfurlLinks }
              : {}),
            ...(isDefined(parameters.unfurlMedia)
              ? { unfurl_media: parameters.unfurlMedia }
              : {}),
            ...(entities.length > 0 ? { metadata: { entities } } : {}),
            ...bodyFields,
          });

          return {
            success: true,
            message: data.ts
              ? `Message posted to Slack (ts=${data.ts}).`
              : 'Message posted to Slack.',
            slackTs: data.ts,
            channel: data.channel,
          };
        } catch (error) {
          lastErrorCode = getSlackApiErrorCode(error);

          throw error;
        }
      },
    });

  const result = await post(recordEntities);

  if (
    result.success ||
    recordEntities.length === 0 ||
    !isSlackMetadataError(lastErrorCode)
  ) {
    return result;
  }

  // a preview Slack refuses must cost the preview, never the message
  return await post([]);
};
