export type UnsubscribeTokenPayload = {
  workspaceId: string;
  emailAddress: string;
  messageTopicId?: string;
  // Epoch milliseconds the token was minted. Not enforced yet; carried so expiry
  // or rotation can be added later without a token-format break.
  issuedAt: number;
};
