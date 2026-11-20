import { isDefined } from 'twenty-shared/utils';

import { type GroupLimiter } from 'src/engine/core-modules/message-queue/drivers/fairness/group-rate-pacer';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatJobGroupMaps } from 'src/engine/metadata-modules/flat-job-group/types/flat-job-group-maps.type';

export const buildJobGroupLimiters = ({
  flatJobGroupMaps,
  applicationId,
  jobGroupUniversalIdentifiers,
}: {
  flatJobGroupMaps: FlatJobGroupMaps;
  applicationId: string;
  // Undefined until the 2.61 instance command adds the column
  jobGroupUniversalIdentifiers: string[] | undefined;
}): GroupLimiter[] =>
  [...new Set(jobGroupUniversalIdentifiers ?? [])].flatMap(
    (jobGroupUniversalIdentifier) => {
      const flatJobGroup = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatJobGroupMaps,
        universalIdentifier: jobGroupUniversalIdentifier,
      });

      return isDefined(flatJobGroup) &&
        flatJobGroup.applicationId === applicationId
        ? [
            {
              groupKey: `jobGroup:${flatJobGroup.universalIdentifier}`,
              limiter: flatJobGroup.limiter,
            },
          ]
        : [];
    },
  );
