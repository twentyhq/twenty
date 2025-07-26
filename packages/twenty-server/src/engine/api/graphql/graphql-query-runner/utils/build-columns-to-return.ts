import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const buildColumnsToReturn = ({
  select,
  relations,
  objectMetadataItemWithFieldMaps,
}: {
  select: Record<string, unknown>;
  relations: Record<string, unknown>;
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
}): string[] => {
  return Object.entries(
    buildColumnsToSelect({
      select,
      relations,
      objectMetadataItemWithFieldMaps,
    }),
  )
    .filter(([_columnName, value]) => value === true)
    .map(([columnName]) => columnName);
};
