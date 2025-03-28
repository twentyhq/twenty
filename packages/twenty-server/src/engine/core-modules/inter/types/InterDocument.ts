export type InterDocument = {
  integrationId: string;
  clientId: string;
  status: 'active' | 'inactive' | 'expired';
  lastSync: Date;
  certificates: {
    privateKey: string;
    certificate: string;
    expirationDate: Date;
  };
};
