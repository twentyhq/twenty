import type { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

export type ApplicationRegistrationData = {
  id: string;
  name: string;
  description?: string | null;
  universalIdentifier: string;
  sourceType: ApplicationRegistrationSourceType;
  sourcePackage?: string | null;
  isListed: boolean;
  isFeatured: boolean;
  oAuthclientId: string;
  oAuthScopes?: string[] | null;
  oAuthRedirectUris?: string[] | null;
};
