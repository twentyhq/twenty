import { type IframeMediaPermission } from 'twenty-shared/types';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { toIframeMediaPermissions } from 'src/engine/core-modules/application/utils/to-iframe-media-permissions.util';

export const resolveSyncedApplicationIframeMediaPermissions = ({
  sourceType,
  grantedIframeMediaPermissions,
  requestedIframeMediaPermissions,
}: {
  sourceType: ApplicationRegistrationSourceType;
  grantedIframeMediaPermissions: IframeMediaPermission[] | undefined;
  requestedIframeMediaPermissions: IframeMediaPermission[] | undefined;
}): IframeMediaPermission[] => {
  if (sourceType !== ApplicationRegistrationSourceType.LOCAL) {
    return toIframeMediaPermissions(grantedIframeMediaPermissions);
  }

  return toIframeMediaPermissions([
    ...toIframeMediaPermissions(grantedIframeMediaPermissions),
    ...toIframeMediaPermissions(requestedIframeMediaPermissions),
  ]);
};
