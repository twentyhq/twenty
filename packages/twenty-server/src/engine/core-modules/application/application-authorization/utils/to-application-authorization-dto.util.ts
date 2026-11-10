import { type ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { type ApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/dtos/application-authorization.dto';

export const toApplicationAuthorizationDto = ({
  authorization,
  oAuthIdentityUniversalIdentifier,
}: {
  authorization: ApplicationAuthorizationEntity;
  oAuthIdentityUniversalIdentifier: string | null;
}): ApplicationAuthorizationDTO => ({
  id: authorization.id,
  applicationId: authorization.applicationId,
  workspaceId: authorization.workspaceId,
  userId: authorization.userId,
  applicationName: authorization.application.name,
  applicationUniversalIdentifier: authorization.application.universalIdentifier,
  scopes: authorization.scopes,
  oAuthIdentityUniversalIdentifier,
  lastAuthorizedAt: authorization.lastAuthorizedAt,
  lastUsedAt: authorization.lastUsedAt,
  createdAt: authorization.createdAt,
});
