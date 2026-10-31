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
  // File name under this module's assets folder
  logo: string;
  // Strings match exactly and are stored on the registration; patterns cover per-connection callbacks
  allowedRedirectUris: (string | RegExp)[];
  clientIdMetadataDocumentHostnames: string[];
};
