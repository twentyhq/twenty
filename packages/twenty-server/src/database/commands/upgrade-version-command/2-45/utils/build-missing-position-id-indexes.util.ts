import { isDefined } from 'twenty-shared/utils';

import {
  buildPositionIdIndexes,
  type PositionIdIndex,
} from 'src/database/commands/upgrade-version-command/2-45/utils/build-position-id-indexes.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const buildMissingPositionIdIndexes = ({
  flatIndexMaps,
  ...args
}: Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
> & { now: string }): PositionIdIndex[] =>
  buildPositionIdIndexes(args).filter(
    ({ universalFlatIndexMetadata }) =>
      !isDefined(
        flatIndexMaps.byUniversalIdentifier[
          universalFlatIndexMetadata.universalIdentifier
        ],
      ),
  );
