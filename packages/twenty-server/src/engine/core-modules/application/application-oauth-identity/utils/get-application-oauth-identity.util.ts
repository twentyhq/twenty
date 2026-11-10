import {
  type ApplicationOAuthIdentity,
  validateApplicationOAuthIdentity,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { isTwentyApplicationPackage } from 'src/engine/core-modules/application/application-registration/utils/is-twenty-application-package.util';

// Only Twenty can publish under its npm scope, so no one else can claim a vendor's callbacks
export const getApplicationOAuthIdentity = (
  registration:
    | Pick<
        ApplicationRegistrationEntity,
        'sourceType' | 'sourcePackage' | 'manifest'
      >
    | null
    | undefined,
): ApplicationOAuthIdentity | null => {
  const oAuthIdentity = registration?.manifest?.application?.oAuthIdentity;

  if (
    !isDefined(oAuthIdentity) ||
    registration?.sourceType !== ApplicationRegistrationSourceType.NPM ||
    !isTwentyApplicationPackage(registration.sourcePackage) ||
    validateApplicationOAuthIdentity(oAuthIdentity).length > 0
  ) {
    return null;
  }

  return oAuthIdentity;
};
