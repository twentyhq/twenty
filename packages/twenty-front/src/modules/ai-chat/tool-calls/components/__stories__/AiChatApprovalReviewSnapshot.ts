export type AiChatApprovalReviewSnapshot = {
  cards: {
    id: string;
    title: string;
    selectedRecordIds: string[];
    skippedRecordIds: string[];
    records: { id: string; values: Record<string, string> }[];
  }[];
};
