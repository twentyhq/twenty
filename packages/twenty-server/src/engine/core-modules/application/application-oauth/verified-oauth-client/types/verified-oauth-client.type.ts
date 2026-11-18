export type VerifiedOAuthClient = {
  name: string;
  marketplaceAppUniversalIdentifier: string;
} & (
  | { registrationUniversalIdentifier: string }
  | { clientIdMetadataDocumentUrl: string }
);
