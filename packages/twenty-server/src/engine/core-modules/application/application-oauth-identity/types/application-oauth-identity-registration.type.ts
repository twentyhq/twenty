import { type ApplicationOAuthIdentity } from 'twenty-shared/application';

export type ApplicationOAuthIdentityRegistration = {
  applicationRegistrationId: string;
  universalIdentifier: string;
  name: string;
  oAuthIdentity: ApplicationOAuthIdentity;
};
