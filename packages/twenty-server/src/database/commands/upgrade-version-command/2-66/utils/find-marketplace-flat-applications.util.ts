import { isDefined } from 'twenty-shared/utils';

import { isMarketplaceApplication } from 'src/engine/core-modules/application/application-manifest/utils/is-marketplace-application.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';

export const findMarketplaceFlatApplications = ({
  flatApplicationMaps,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatApplicationMaps: Pick<FlatApplicationCacheMaps, 'byId'>;
  workspaceCustomApplicationUniversalIdentifier: string;
}): FlatApplication[] =>
  Object.values(flatApplicationMaps.byId)
    .filter(isDefined)
    .filter(
      (flatApplication) =>
        !isDefined(flatApplication.deletedAt) &&
        isMarketplaceApplication({
          universalIdentifier: flatApplication.universalIdentifier,
          sourceType: flatApplication.sourceType,
          workspaceCustomApplicationUniversalIdentifier,
        }),
    );
