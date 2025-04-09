export type InterIntegration = {
  id: string;
  integrationName: string;
  clientId: string;
  clientSecret: string;
  privateKey?: string | null;
  certificate?: string | null;
  status: string;
  workspaceId: string;
  expirationDate?: Date | null;
  workspace: {
    id: string;
  };
};
