export type WhatsappIngestResult = {
  ingestedMessageCount: number;
  matchedPersonCount: number;
  createdPersonCount: number;
  importedAttachmentCount: number;
  skippedReason?:
    | 'NOT_SELECTED'
    | 'GROUP_CHATS_OFF'
    | 'NO_MESSAGES'
    | 'NO_PHONE'
    | 'NO_CONTACT';
};
