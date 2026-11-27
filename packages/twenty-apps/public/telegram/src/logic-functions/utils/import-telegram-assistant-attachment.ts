import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { TELEGRAM_ASSISTANT_ATTACHMENT_UPLOAD_TIMEOUT_MS } from 'src/logic-functions/constants/telegram-assistant-attachment-upload-timeout-ms';
import { type TelegramAssistantAttachment } from 'src/logic-functions/types/telegram-assistant-attachment.type';
import { type TelegramInboundAttachment } from 'src/logic-functions/types/telegram-inbound-attachment.type';
import { downloadTelegramFileOrThrow } from 'src/logic-functions/utils/download-telegram-file-or-throw';
import { uploadFileToAgentChatOrThrow } from 'src/logic-functions/utils/upload-file-to-agent-chat-or-throw';

export const importTelegramAssistantAttachment = async ({
  botToken,
  attachment,
}: {
  botToken: string;
  attachment: Pick<TelegramInboundAttachment, 'telegramFileId' | 'fileName'>;
}): Promise<TelegramAssistantAttachment | undefined> => {
  try {
    const bytes = await downloadTelegramFileOrThrow({
      botToken,
      telegramFileId: attachment.telegramFileId,
    });
    const fileId = await uploadFileToAgentChatOrThrow({
      metadataClient: new MetadataApiClient(),
      fileName: attachment.fileName,
      bytes,
      timeoutMs: TELEGRAM_ASSISTANT_ATTACHMENT_UPLOAD_TIMEOUT_MS,
    });

    return { fileId, filename: attachment.fileName };
  } catch (error) {
    console.warn('[telegram] could not read the attached file', error);

    return undefined;
  }
};
