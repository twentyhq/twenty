export type UnsubscribeTokenPayload = {
  workspaceId: string;
  emailAddress: string;
  preview?: boolean;
  issuedAt: number;
};
