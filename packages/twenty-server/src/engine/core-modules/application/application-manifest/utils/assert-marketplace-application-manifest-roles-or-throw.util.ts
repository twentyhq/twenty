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

// Standalone roles are not rejected: the sync ignores new ones and freezes installed ones
export const assertMarketplaceApplicationManifestRolesOrThrow = ({
  manifest,
}: {
  manifest: Pick<Manifest, 'application' | 'roles' | 'agents'>;
}): void => {
  const violations = getApplicationManifestRoleViolations({ manifest }).filter(
    (violation) => violation.kind !== 'standaloneRole',
  );

  if (!isNonEmptyArray(violations)) {
    return;
  }

  throw new ApplicationException(
    `Application "${manifest.application.displayName}" (${manifest.application.universalIdentifier}) declares role permissions marketplace applications cannot declare: ${violations.map(formatApplicationManifestRoleViolation).join(' ')}`,
    ApplicationExceptionCode.INVALID_INPUT,
  );
};
