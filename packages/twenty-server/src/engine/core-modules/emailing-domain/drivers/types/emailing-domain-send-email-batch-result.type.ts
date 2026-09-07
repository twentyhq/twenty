export type EmailingDomainSendEmailBatchResult = {
  // Index into the recipients the driver was handed. Drivers already build
  // their results by walking that array, so reporting the position keeps a
  // result attached to its recipient without the caller re-deriving it from
  // the address, which two recipients can share.
  entries: {
    recipientIndex: number;
    messageId: string | null;
    errorMessage: string | null;
  }[];
};
