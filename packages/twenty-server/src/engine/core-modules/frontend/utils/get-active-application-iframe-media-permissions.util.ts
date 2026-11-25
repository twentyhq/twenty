import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { toIframeMediaPermissions } from 'src/engine/core-modules/application/utils/to-iframe-media-permissions.util';

export const getActiveApplicationIframeMediaPermissions = (
  applications: readonly (
    | Pick<FlatApplication, 'deletedAt' | 'grantedIframeMediaPermissions'>
    | undefined
  )[],
): IframeMediaPermission[] =>
  applications.flatMap((application) => {
    if (!isDefined(application) || isDefined(application.deletedAt)) {
      return [];
    }

    return toIframeMediaPermissions(application.grantedIframeMediaPermissions);
  });
