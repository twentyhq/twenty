export type UnsubscribeTokenPayload = {
  workspaceId: string;
  emailAddress: string;
  unsubscribeTopicId?: string;
  preview?: boolean;
  issuedAt: number;
};
