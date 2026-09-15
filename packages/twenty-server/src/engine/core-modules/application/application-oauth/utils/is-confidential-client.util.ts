import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

// A confidential client is one registered with a secret. It must authenticate
// on every token endpoint that acts on its behalf (RFC 6749 §2.3, RFC 7662
// §2.1), so a request that omits the secret cannot be trusted.
export const isConfidentialClient = (
  applicationRegistration: Pick<
    ApplicationRegistrationEntity,
    'oAuthClientSecretHash'
  >,
): boolean => isNonEmptyString(applicationRegistration.oAuthClientSecretHash);
