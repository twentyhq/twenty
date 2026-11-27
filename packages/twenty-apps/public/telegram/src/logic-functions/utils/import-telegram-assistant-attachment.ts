import { type TelegramAssistantAttachment } from 'src/logic-functions/types/telegram-assistant-attachment.type';
import { type TelegramInboundAttachment } from 'src/logic-functions/types/telegram-inbound-attachment.type';
import { downloadTelegramFileOrThrow } from 'src/logic-functions/utils/download-telegram-file-or-throw';
import { uploadFileToAgentChat } from 'src/logic-functions/utils/upload-file-to-agent-chat';

export const importTelegramAssistantAttachment = async ({
  botToken,
  attachment,
}: {
  botToken: string;
  attachment: TelegramInboundAttachment;
}): Promise<TelegramAssistantAttachment | undefined> => {
  try {
    const bytes = await downloadTelegramFileOrThrow({
      botToken,
      telegramFileId: attachment.telegramFileId,
    });
    const fileId = await uploadFileToAgentChat({
      fileName: attachment.fileName,
      bytes,
    });

    return { fileId, filename: attachment.fileName };
  } catch (error) {
    console.warn('[telegram] could not read the attached file', error);

    return undefined;
  }
};
