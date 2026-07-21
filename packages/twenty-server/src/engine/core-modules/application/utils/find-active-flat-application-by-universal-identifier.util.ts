import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';

export const findActiveFlatApplicationByUniversalIdentifier = (
  flatApplicationMaps: FlatApplicationCacheMaps,
  applicationUniversalIdentifier: string,
): FlatApplication | undefined => {
  const applicationId =
    flatApplicationMaps.idByUniversalIdentifier[applicationUniversalIdentifier];

  return isDefined(applicationId)
    ? findActiveFlatApplicationById(flatApplicationMaps, applicationId)
    : undefined;
};
