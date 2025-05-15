export type InterIntegration = {
  id: string;
  integrationName: string;
  clientId: string;
  clientSecret: string;
  privateKey?: File | string | null;
  certificate?: File | string | null;
  status?: string;
  workspaceId: string;
  expirationDate?: Date | null;
  workspace: {
    id: string;
  };
};
