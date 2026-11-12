import { isDefined } from 'twenty-shared/utils';

import { isVerifiedOAuthClientUniversalIdentifier } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-universal-identifier.util';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

export const isVerifiedOAuthClientRegistration = ({
  universalIdentifier,
  sourceType,
  ownerWorkspaceId,
  createdByUserId,
  oAuthClientSecretHash,
}: Pick<
  ApplicationRegistrationEntity,
  | 'universalIdentifier'
  | 'sourceType'
  | 'ownerWorkspaceId'
  | 'createdByUserId'
  | 'oAuthClientSecretHash'
>): boolean =>
  isVerifiedOAuthClientUniversalIdentifier(universalIdentifier) &&
  sourceType === ApplicationRegistrationSourceType.OAUTH_ONLY &&
  !isDefined(ownerWorkspaceId) &&
  !isDefined(createdByUserId) &&
  !isDefined(oAuthClientSecretHash);
