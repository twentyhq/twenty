export type EmailingDomainSendEmailBatchResult = {
  entries: {
    email: string;
    messageId: string | null;
    errorMessage: string | null;
  }[];
};
