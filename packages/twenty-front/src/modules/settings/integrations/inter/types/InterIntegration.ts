export type InterIntegration = {
  id: string;
  integrationName: string;
  clientId: string;
  clientSecret: string;
  privateKey: string;
  certificate: string;
  status: string;
  expirationDate?: Date;
  workspace: {
    id: string;
  };
};
