import { isDefined } from 'twenty-shared/utils';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type WellKnownOAuthClientDefinition } from 'src/engine/core-modules/application/well-known-oauth-client/types/well-known-oauth-client-definition.type';
import { findWellKnownOAuthClientByRedirectUris } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-redirect-uris.util';
import { findWellKnownOAuthClientByUniversalIdentifier } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-universal-identifier.util';

// Per-connection registrations made before the seeded ones existed hold live refresh tokens, so they are recognized by their callbacks
export const getWellKnownOAuthClientOfRegistration = (
  registration: Pick<
    ApplicationRegistrationEntity,
    | 'universalIdentifier'
    | 'sourceType'
    | 'ownerWorkspaceId'
    | 'oAuthRedirectUris'
  >,
): WellKnownOAuthClientDefinition | undefined => {
  const seededWellKnownOAuthClient =
    findWellKnownOAuthClientByUniversalIdentifier(
      registration.universalIdentifier,
    );

  if (isDefined(seededWellKnownOAuthClient)) {
    return seededWellKnownOAuthClient;
  }

  if (
    registration.sourceType !== ApplicationRegistrationSourceType.OAUTH_ONLY ||
    isDefined(registration.ownerWorkspaceId)
  ) {
    return undefined;
  }

  return findWellKnownOAuthClientByRedirectUris(registration.oAuthRedirectUris);
};
