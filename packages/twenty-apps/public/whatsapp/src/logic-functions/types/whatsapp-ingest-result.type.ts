export type WhatsappIngestResult = {
  ingestedMessageCount: number;
  matchedPersonCount: number;
  createdPersonCount: number;
  importedAttachmentCount: number;
  skippedReason?: 'GROUP_CHATS_OFF' | 'NO_MESSAGES' | 'NO_PHONE' | 'NO_CONTACT';
};
