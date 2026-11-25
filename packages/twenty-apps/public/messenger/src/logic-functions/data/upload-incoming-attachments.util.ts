import { uploadMessageAttachment } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { buildIncomingAttachmentFilename } from 'src/logic-functions/data/build-incoming-attachment-filename.util';
import { downloadIncomingAttachment } from 'src/logic-functions/data/download-incoming-attachment.util';
import { type IncomingFileAttachment } from 'src/logic-functions/types/incoming-file-attachment.type';

export const uploadIncomingAttachments = async ({
  messageId,
  fileAttachments,
}: {
  messageId: string;
  fileAttachments: IncomingFileAttachment[];
}) => {
  const uploadedAttachments: { fileId: string; label: string }[] = [];

  for (const { url, type, index } of fileAttachments) {
    const content = await downloadIncomingAttachment(url);

    if (!isDefined(content)) {
      console.warn(
        `Attachment ${index} of Messenger message ${messageId} not imported: over the size limit`,
      );

      continue;
    }

    uploadedAttachments.push(
      await uploadMessageAttachment({
        filename: buildIncomingAttachmentFilename({
          url,
          attachmentType: type,
          messageId,
          index,
        }),
        content,
      }),
    );
  }

  return uploadedAttachments;
};
