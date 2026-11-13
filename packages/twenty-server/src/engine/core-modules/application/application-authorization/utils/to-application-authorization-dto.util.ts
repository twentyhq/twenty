import { isDefined } from 'twenty-shared/utils';

import { type ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { type ApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/dtos/application-authorization.dto';
import { findVerifiedOAuthClientForRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-verified-oauth-client-for-registration.util';

export const toApplicationAuthorizationDTO = ({
  authorization,
  marketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl,
}: {
  authorization: ApplicationAuthorizationEntity;
  marketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl: Record<
    string,
    string
  >;
}): ApplicationAuthorizationDTO => {
  const { applicationRegistration } = authorization.application;

  return {
    id: authorization.id,
    applicationId: authorization.applicationId,
    workspaceId: authorization.workspaceId,
    userId: authorization.userId,
    applicationName: authorization.application.name,
    applicationUniversalIdentifier:
      authorization.application.universalIdentifier,
    marketplaceAppUniversalIdentifier: isDefined(applicationRegistration)
      ? (findVerifiedOAuthClientForRegistration(applicationRegistration)
          ?.marketplaceAppUniversalIdentifier ??
        marketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl[
          applicationRegistration.oAuthClientId
        ] ??
        null)
      : null,
    scopes: authorization.scopes,
    lastAuthorizedAt: authorization.lastAuthorizedAt,
    lastUsedAt: authorization.lastUsedAt,
    createdAt: authorization.createdAt,
  };
};
