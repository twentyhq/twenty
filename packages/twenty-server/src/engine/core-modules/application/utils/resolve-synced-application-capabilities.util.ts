import { type ApplicationCapability } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { toApplicationCapabilities } from 'src/engine/core-modules/application/utils/to-application-capabilities.util';

export const resolveSyncedApplicationCapabilities = ({
  sourceType,
  grantedCapabilities,
  requestedCapabilities,
}: {
  sourceType: ApplicationRegistrationSourceType;
  grantedCapabilities: ApplicationCapability[] | undefined;
  requestedCapabilities: string[] | undefined;
}): ApplicationCapability[] => {
  const resolvedRequestedCapabilities = toApplicationCapabilities(
    requestedCapabilities,
  );

  if (sourceType === ApplicationRegistrationSourceType.LOCAL) {
    return [
      ...new Set([
        ...toApplicationCapabilities(grantedCapabilities),
        ...resolvedRequestedCapabilities,
      ]),
    ];
  }

  return toApplicationCapabilities(grantedCapabilities);
};
