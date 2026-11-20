import { type IngestMessageAttachment, kv, uploadMessageAttachment } from 'twenty-sdk/logic-function';
import { WHATSAPP_KV_KEY_PREFIXES } from 'src/constants/whatsapp-kv-key-prefixes.constant';
import { downloadWhatsAppFile } from 'src/logic-functions/data/download-file.util';
import { truncateAttachmentFilename } from 'src/logic-functions/data/truncate-attachment-filename.util';
import { type WhatsAppFile } from 'src/logic-functions/types/whatsapp-file.type';

// a retry after a failed ingest reuses the file uploaded by the previous attempt
export const uploadWhatsAppMediaAttachmentOnce = async ({
  accessToken,
  messageId,
  file,
}: {
  accessToken: string;
  messageId: string;
  file: WhatsAppFile;
}): Promise<IngestMessageAttachment> => {
  const key = `${WHATSAPP_KV_KEY_PREFIXES.messageAttachment}${messageId}`;
  const uploadedAttachment = await kv.get<IngestMessageAttachment>(key);

  if (uploadedAttachment !== null) {
    return uploadedAttachment;
  }

  const { fileBuffer } = await downloadWhatsAppFile({ accessToken, mediaId: file.mediaId });
  const attachment = await uploadMessageAttachment({
    filename: truncateAttachmentFilename(file.fileName),
    content: fileBuffer,
  });

  await kv.set(key, attachment);

  return attachment;
};
