export type VerifiedOAuthClient = {
  name: string;
  marketplaceAppUniversalIdentifier: string;
  logoPath?: string;
} & (
  | { registrationUniversalIdentifier: string }
  | { clientIdMetadataDocumentUrl: string }
);
