import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';

// Universal identifiers so an app can be classified before its first install
export const isMarketplaceApplication = ({
  universalIdentifier,
  sourceType,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  universalIdentifier: string;
  sourceType: ApplicationRegistrationSourceType;
  workspaceCustomApplicationUniversalIdentifier: string;
}): boolean =>
  universalIdentifier !== workspaceCustomApplicationUniversalIdentifier &&
  universalIdentifier !== TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER &&
  !isOAuthOnlyApplication({ sourceType });
