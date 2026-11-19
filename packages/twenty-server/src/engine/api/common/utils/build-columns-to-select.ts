import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildColumnsToSelect = ({
  selection,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  selection: Pick<CommonSelection, 'columns' | 'relations'>;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Record<string, boolean> => {
  const fieldsToSelect: Record<string, boolean> = { ...selection.columns };

  for (const columnName of getRequiredRelationColumns({
    relations: selection.relations,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  })) {
    fieldsToSelect[columnName] = true;
  }

  return { ...fieldsToSelect, id: true };
};

const getRequiredRelationColumns = ({
  relations,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  relations: CommonSelection['relations'];
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string[] => {
  const requiredColumns: string[] = [];
  const selectedRelationFieldNames = new Set(
    Object.values(relations)
      .filter(isDefined)
      .map(({ fieldName }) => fieldName),
  );

  for (const fieldId of flatObjectMetadata.fieldIds) {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION)) {
      if (
        !selectedRelationFieldNames.has(fieldMetadata.name) ||
        fieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE
      ) {
        continue;
      }

      requiredColumns.push(
        computeMorphOrRelationFieldJoinColumnName({ name: fieldMetadata.name }),
      );
    }

    if (
      isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.MORPH_RELATION)
    ) {
      const targetObjectMetadata = fieldMetadata.relationTargetObjectMetadataId
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;

      if (
        fieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE ||
        !isDefined(targetObjectMetadata)
      ) {
        continue;
      }

      if (!selectedRelationFieldNames.has(fieldMetadata.name)) {
        continue;
      }

      requiredColumns.push(
        computeMorphOrRelationFieldJoinColumnName({ name: fieldMetadata.name }),
      );
    }
  }

  return requiredColumns;
};
