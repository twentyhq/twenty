export type UnsubscribeTokenPayload = {
  workspaceId: string;
  emailAddress: string;
  messageTopicId?: string;
  // True for tokens minted by the in-app preview action; the page renders
  // normally but opt-out POSTs are no-ops, so a preview never mutates state.
  preview?: boolean;
  // Epoch milliseconds the token was minted. Not enforced yet; carried so expiry
  // or rotation can be added later without a token-format break.
  issuedAt: number;
};
