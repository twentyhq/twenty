import { getConflictingFields } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-conflicting-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeDuplicateKeyColumnGroupsForJoinColumn = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatIndexMaps,
  joinColumnName,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  joinColumnName: string;
}): string[][] =>
  getConflictingFields(flatObjectMetadata, flatFieldMetadataMaps, flatIndexMaps)
    .map((conflictingFieldGroup) =>
      conflictingFieldGroup.conflictingProperties.map(
        (conflictingProperty) => conflictingProperty.column,
      ),
    )
    .filter((uniqueIndexColumns) => uniqueIndexColumns.includes(joinColumnName))
    .map((uniqueIndexColumns) =>
      uniqueIndexColumns.filter((column) => column !== joinColumnName),
    );
