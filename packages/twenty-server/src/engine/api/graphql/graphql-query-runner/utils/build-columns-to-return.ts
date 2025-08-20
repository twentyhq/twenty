import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const buildColumnsToReturn = ({
  select,
  relations,
  objectMetadataItemWithFieldMaps,
  objectMetadataMaps,
}: {
  select: Record<string, unknown>;
  relations: Record<string, unknown>;
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  objectMetadataMaps: ObjectMetadataMaps;
}): string[] => {
  return Object.entries(
    buildColumnsToSelect({
      select,
      relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    }),
  )
    .filter(([_columnName, value]) => value === true)
    .map(([columnName]) => columnName);
};
