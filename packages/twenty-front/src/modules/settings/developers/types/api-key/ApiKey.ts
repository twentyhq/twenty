export type ApiKey = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  expiresAt: string;
  revokedAt: string | null;
  __typename: 'ApiKey';
};
