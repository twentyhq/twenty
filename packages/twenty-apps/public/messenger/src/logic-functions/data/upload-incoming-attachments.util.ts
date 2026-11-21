import axios from 'axios';
import { uploadMessageAttachment } from 'twenty-sdk/logic-function';

import { buildIncomingAttachmentFilename } from 'src/logic-functions/data/build-incoming-attachment-filename.util';
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
    const { data } = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });

    uploadedAttachments.push(
      await uploadMessageAttachment({
        filename: buildIncomingAttachmentFilename({
          url,
          attachmentType: type,
          messageId,
          index,
        }),
        content: new Uint8Array(data),
      }),
    );
  }

  return uploadedAttachments;
};
