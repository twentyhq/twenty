import { isDefined } from 'twenty-shared/utils';

import { getApplicationOAuthIdentity } from 'src/engine/core-modules/application/application-oauth-identity/utils/get-application-oauth-identity.util';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

// An app with an OAuth identity ships nothing either: its installs only hold the grants members give it
export const isOAuthOnlyApplicationRegistration = (
  registration: Pick<
    ApplicationRegistrationEntity,
    'sourceType' | 'sourcePackage' | 'manifest'
  >,
): boolean =>
  registration.sourceType === ApplicationRegistrationSourceType.OAUTH_ONLY ||
  isDefined(getApplicationOAuthIdentity(registration));
