import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';

export const isVerifiedOAuthClientRegistration = ({
  universalIdentifier,
}: Pick<ApplicationRegistrationEntity, 'universalIdentifier'>): boolean =>
  VERIFIED_OAUTH_CLIENTS.some(
    ({ registrationUniversalIdentifier }) =>
      registrationUniversalIdentifier === universalIdentifier,
  );
