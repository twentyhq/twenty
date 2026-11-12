export type VerifiedOAuthClient = { name: string; logoPath?: string } & (
  | { registrationUniversalIdentifier: string }
  | { clientIdMetadataDocumentUrl: string }
);
