import type { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

export type ApplicationRegistrationData = {
  id: string;
  name: string;
  description: string;
  universalIdentifier: string;
  sourceType: ApplicationRegistrationSourceType;
  sourcePackage?: string | null;
  isListed: boolean;
  isFeatured: boolean;
  oAuthClientId: string;
  oAuthScopes?: string[] | null;
  oAuthRedirectUris?: string[] | null;
};
