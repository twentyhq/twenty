export type AiChatApprovalMergeReviewSnapshot = {
  pairs: {
    pairId: string;
    priorityRecordId: string;
    sourceRecordIds: readonly [string, string];
  }[];
};
