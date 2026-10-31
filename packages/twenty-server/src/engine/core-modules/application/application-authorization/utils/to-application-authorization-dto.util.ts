import { isDefined } from 'twenty-shared/utils';

import { type ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { type ApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/dtos/application-authorization.dto';
import { getWellKnownOAuthClientOfRegistration } from 'src/engine/core-modules/application/well-known-oauth-client/utils/get-well-known-oauth-client-of-registration.util';

export const toApplicationAuthorizationDto = (
  authorization: ApplicationAuthorizationEntity,
): ApplicationAuthorizationDTO => ({
  id: authorization.id,
  applicationId: authorization.applicationId,
  workspaceId: authorization.workspaceId,
  userId: authorization.userId,
  applicationName: authorization.application.name,
  applicationUniversalIdentifier: authorization.application.universalIdentifier,
  scopes: authorization.scopes,
  wellKnownOAuthClient: isDefined(
    authorization.application.applicationRegistration,
  )
    ? (getWellKnownOAuthClientOfRegistration(
        authorization.application.applicationRegistration,
      )?.client ?? null)
    : null,
  lastAuthorizedAt: authorization.lastAuthorizedAt,
  lastUsedAt: authorization.lastUsedAt,
  createdAt: authorization.createdAt,
});
