import { type ApplicationCategory } from 'twenty-shared/application';

import { type WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';

export type WellKnownOAuthClientDefinition = {
  client: WellKnownOAuthClient;
  universalIdentifier: string;
  name: string;
  description: string;
  aboutDescription: string;
  author: string;
  category: ApplicationCategory;
  websiteUrl: string;
  logo: string;
  allowedRedirectUris: (string | RegExp)[];
  clientIdMetadataDocumentHostnames: string[];
};
