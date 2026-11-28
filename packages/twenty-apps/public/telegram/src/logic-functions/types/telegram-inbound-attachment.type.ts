export type TelegramInboundAttachment = {
  telegramFileId: string;
  fileName: string;
  mimeType: string | undefined;
  sizeBytes: number | undefined;
};
