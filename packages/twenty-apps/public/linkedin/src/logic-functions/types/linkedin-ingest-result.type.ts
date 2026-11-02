export type LinkedinIngestResult = {
  ingestedMessageCount: number;
  matchedPersonCount: number;
  createdPersonCount: number;
  importedAttachmentCount: number;
  skippedReason?: 'GROUP_CHATS_OFF' | 'NO_MESSAGES' | 'NO_CONTACT';
};
