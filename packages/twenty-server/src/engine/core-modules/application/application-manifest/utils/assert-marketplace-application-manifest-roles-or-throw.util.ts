import {
  formatApplicationManifestRoleViolation,
  getApplicationManifestRoleViolations,
  type Manifest,
} from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const assertMarketplaceApplicationManifestRolesOrThrow = ({
  manifest,
}: {
  manifest: Pick<Manifest, 'application' | 'roles' | 'agents'>;
}): void => {
  const violations = getApplicationManifestRoleViolations({ manifest });

  if (!isNonEmptyArray(violations)) {
    return;
  }

  throw new ApplicationException(
    `Application "${manifest.application.displayName}" (${manifest.application.universalIdentifier}) declares roles marketplace applications cannot declare: ${violations.map(formatApplicationManifestRoleViolation).join(' ')}`,
    ApplicationExceptionCode.INVALID_INPUT,
  );
};
