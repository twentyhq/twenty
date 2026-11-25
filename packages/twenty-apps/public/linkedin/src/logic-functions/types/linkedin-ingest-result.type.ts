export type LinkedinIngestResult = {
  ingestedMessageCount: number;
  matchedPersonCount: number;
  createdPersonCount: number;
  importedAttachmentCount: number;
  skippedReason?: 'NOT_SELECTED' | 'NO_MESSAGES' | 'NO_CONTACT';
};
