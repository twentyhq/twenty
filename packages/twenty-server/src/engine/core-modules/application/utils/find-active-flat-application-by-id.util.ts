import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';

// Soft-deleted applications are kept in the cache maps (computed with
// withDeleted), so callers that only care about live applications must filter
// them out here.
export const findActiveFlatApplicationById = (
  flatApplicationMaps: FlatApplicationCacheMaps,
  applicationId: string,
): FlatApplication | undefined => {
  const application = flatApplicationMaps.byId[applicationId];

  if (!isDefined(application) || isDefined(application.deletedAt)) {
    return undefined;
  }

  return application;
};
