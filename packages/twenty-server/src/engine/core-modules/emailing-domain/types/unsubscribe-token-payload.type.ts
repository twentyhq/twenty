export type UnsubscribeTokenPayload = {
  workspaceId: string;
  emailAddress: string;
  preview?: true;
  issuedAt: number;
};
