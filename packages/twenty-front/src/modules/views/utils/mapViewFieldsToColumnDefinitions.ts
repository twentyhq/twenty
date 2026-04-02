import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { buildRelationSubFieldColumnDefinition } from '@/views/utils/buildRelationSubFieldColumnDefinition';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { isDefined } from 'twenty-shared/utils';
import { type ViewField } from '@/views/types/ViewField';

export const mapViewFieldsToColumnDefinitions = ({
  columnDefinitions,
  viewFields,
  objectMetadataItems,
}: {
  columnDefinitions: ColumnDefinition<FieldMetadata>[];
  viewFields: ViewField[];
  objectMetadataItems?: EnrichedObjectMetadataItem[];
}): ColumnDefinition<FieldMetadata>[] => {
  let labelIdentifierFieldMetadataId = '';

  const columnDefinitionsByFieldMetadataId = mapArrayToObject(
    columnDefinitions,
    ({ fieldMetadataId }) => fieldMetadataId,
  );

  const columnDefinitionsFromViewFields = viewFields
    .map((viewField) => {
      const correspondingColumnDefinition =
        columnDefinitionsByFieldMetadataId[viewField.fieldMetadataId];

      if (isUndefinedOrNull(correspondingColumnDefinition)) return null;

      // OMNIA-CUSTOM: Handle relation sub-field columns
      if (viewField.subFieldName && objectMetadataItems) {
        const subFieldColDef = buildRelationSubFieldColumnDefinition({
          relationColumnDefinition: correspondingColumnDefinition,
          subFieldName: viewField.subFieldName,
          objectMetadataItems,
        });

        if (!subFieldColDef) return null;

        return {
          ...subFieldColDef,
          position: viewField.position,
          size: viewField.size ?? subFieldColDef.size,
          isVisible: viewField.isVisible,
          viewFieldId: viewField.id,
        } as ColumnDefinition<FieldMetadata>;
      }

      const { isLabelIdentifier } = correspondingColumnDefinition;

      if (isLabelIdentifier === true) {
        labelIdentifierFieldMetadataId =
          correspondingColumnDefinition.fieldMetadataId;
      }

      return {
        fieldMetadataId: viewField.fieldMetadataId,
        label: correspondingColumnDefinition.label,
        metadata: correspondingColumnDefinition.metadata,
        iconName: correspondingColumnDefinition.iconName,
        type: correspondingColumnDefinition.type,
        position: isLabelIdentifier ? 0 : viewField.position,
        size: viewField.size ?? correspondingColumnDefinition.size,
        isLabelIdentifier,
        isVisible: isLabelIdentifier || viewField.isVisible,
        viewFieldId: viewField.id,
        isUIReadOnly: correspondingColumnDefinition.metadata.isUIReadOnly,
        isSortable: correspondingColumnDefinition.isSortable,
        isFilterable: correspondingColumnDefinition.isFilterable,
        defaultValue: correspondingColumnDefinition.defaultValue,
        settings:
          'settings' in correspondingColumnDefinition.metadata
            ? correspondingColumnDefinition.metadata.settings
            : undefined,
      } as ColumnDefinition<FieldMetadata>;
    })
    .filter(isDefined);

  // No label identifier set for this object
  if (!labelIdentifierFieldMetadataId) return columnDefinitionsFromViewFields;

  const labelIdentifierIndex = columnDefinitionsFromViewFields.findIndex(
    ({ fieldMetadataId }) => fieldMetadataId === labelIdentifierFieldMetadataId,
  );

  // Label identifier field found in view fields
  // => move it to the start of the list
  return moveArrayItem(columnDefinitionsFromViewFields, {
    fromIndex: labelIdentifierIndex,
    toIndex: 0,
  });
};
