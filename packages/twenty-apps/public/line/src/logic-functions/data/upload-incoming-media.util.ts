import { isNonEmptyString } from '@sniptt/guards';
import {
  uploadMessageAttachment,
  type IngestMessageAttachment,
} from 'twenty-sdk/logic-function';

import { LINE_INCOMING_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/line-incoming-attachment-max-size-bytes.constant';
import { buildIncomingAttachmentFilename } from 'src/logic-functions/data/build-incoming-attachment-filename.util';
import { downloadLineMessageContent } from 'src/logic-functions/data/download-line-message-content.util';
import { type LineMessage } from 'src/logic-functions/types/line-webhook.type';

type IncomingMedia = {
  attachments: IngestMessageAttachment[];
  note?: string;
};

const TOO_LARGE_NOTE = `(larger than ${LINE_INCOMING_ATTACHMENT_MAX_SIZE_BYTES / 1024 / 1024} MB, not imported)`;
const UNAVAILABLE_NOTE = '(no longer available on LINE)';

export const uploadIncomingMedia = async ({
  accessToken,
  message,
}: {
  accessToken: string;
  message: LineMessage;
}): Promise<IncomingMedia> => {
  if (
    message.type !== 'image' &&
    message.type !== 'video' &&
    message.type !== 'audio' &&
    message.type !== 'file'
  ) {
    return { attachments: [] };
  }

  // content hosted by a partner service is not served by LINE's content endpoint
  if (message.type !== 'file' && message.contentProvider.type === 'external') {
    const { originalContentUrl } = message.contentProvider;

    return {
      attachments: [],
      note: isNonEmptyString(originalContentUrl)
        ? originalContentUrl
        : UNAVAILABLE_NOTE,
    };
  }

  if (
    message.type === 'file' &&
    message.fileSize > LINE_INCOMING_ATTACHMENT_MAX_SIZE_BYTES
  ) {
    return { attachments: [], note: TOO_LARGE_NOTE };
  }

  const download = await downloadLineMessageContent({
    accessToken,
    messageId: message.id,
  });

  switch (download.status) {
    case 'tooLarge':
      return { attachments: [], note: TOO_LARGE_NOTE };
    case 'unavailable':
      return { attachments: [], note: UNAVAILABLE_NOTE };
    case 'downloaded':
      return {
        attachments: [
          await uploadMessageAttachment({
            filename: buildIncomingAttachmentFilename({
              message,
              contentType: download.contentType,
            }),
            content: download.content,
          }),
        ],
      };
  }
};
