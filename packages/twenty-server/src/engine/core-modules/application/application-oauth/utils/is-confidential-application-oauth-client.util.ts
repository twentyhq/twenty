import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export const isConfidentialApplicationOAuthClient = (
  applicationRegistration: Pick<
    ApplicationRegistrationEntity,
    'oAuthClientSecretHash'
  >,
): boolean => isNonEmptyString(applicationRegistration.oAuthClientSecretHash);
