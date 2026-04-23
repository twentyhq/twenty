import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { type MetadataValidationRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-validation-related-metadata-names.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';

export type MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps<
  T extends AllMetadataName,
> = Pick<
  AllUniversalFlatEntityMaps,
  MetadataRelatedFlatEntityMapsKeys<T> | MetadataToFlatEntityMapsKey<T>
>;

export type MetadataFlatEntityAndRelatedFlatEntityMaps<
  T extends AllMetadataName,
> = Pick<
  AllFlatEntityMaps,
  MetadataRelatedFlatEntityMapsKeys<T> | MetadataToFlatEntityMapsKey<T>
>;

export type MetadataValidationRelatedUniversalFlatEntityMaps<
  T extends AllMetadataName,
> =
  MetadataValidationRelatedMetadataNames<T> extends undefined
    ? undefined
    : Pick<
        AllUniversalFlatEntityMaps,
        MetadataToFlatEntityMapsKey<
          NonNullable<MetadataValidationRelatedMetadataNames<T>>
        >
      >;
