import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

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
