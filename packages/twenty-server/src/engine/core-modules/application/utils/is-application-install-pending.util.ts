import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';

export const isApplicationInstallPending = (
  flatApplicationMaps: FlatApplicationCacheMaps,
  applicationId: string,
): boolean => {
  const application = findActiveFlatApplicationById(
    flatApplicationMaps,
    applicationId,
  );

  return isDefined(application) && !isDefined(application.version);
};
