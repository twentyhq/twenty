import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type SettingsApplicationsTableApplication } from '@/settings/applications/types/SettingsApplicationsTableApplication';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

export const STANDARD_APPLICATION: SettingsApplicationsTableApplication = {
  id: 'standard-application-id',
  name: 'Standard',
  universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

export const NPM_APPLICATION: SettingsApplicationsTableApplication = {
  id: 'npm-application-id',
  name: 'Acme Sync',
  description: 'Keeps Acme in sync',
  universalIdentifier: 'npm-application-universal-identifier',
  sourceType: ApplicationRegistrationSourceType.NPM,
  applicationRegistration: {
    id: 'npm-registration-id',
    sourceType: ApplicationRegistrationSourceType.NPM,
    oAuthIdentityUniversalIdentifier: null,
  },
};

export const TARBALL_APPLICATION: SettingsApplicationsTableApplication = {
  id: 'tarball-application-id',
  name: 'Weather Widget',
  description: 'Shows local weather on company records',
  universalIdentifier: 'tarball-application-universal-identifier',
  sourceType: ApplicationRegistrationSourceType.TARBALL,
  applicationRegistration: {
    id: 'tarball-registration-id',
    sourceType: ApplicationRegistrationSourceType.TARBALL,
    oAuthIdentityUniversalIdentifier: null,
  },
};

export const OAUTH_ONLY_APPLICATION: SettingsApplicationsTableApplication = {
  id: 'oauth-application-id',
  name: 'Zapier',
  universalIdentifier: 'oauth-application-universal-identifier',
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  applicationRegistration: {
    id: 'oauth-registration-id',
    sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    oAuthIdentityUniversalIdentifier: null,
  },
};
