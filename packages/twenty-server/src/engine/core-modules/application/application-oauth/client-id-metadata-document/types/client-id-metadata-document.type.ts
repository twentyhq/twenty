export type ClientIdMetadataDocument = {
  clientId: string;
  clientName: string | null;
  logoUri: string | null;
  redirectUris: string[];
};
