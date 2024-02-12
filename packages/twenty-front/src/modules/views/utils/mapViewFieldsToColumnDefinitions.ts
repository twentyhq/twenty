import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { assertNotNull } from '~/utils/assert';

import { ViewField } from '../types/ViewField';

export const mapViewFieldsToColumnDefinitions = ({
  columnDefinitions,
  viewFields,
}: {
  columnDefinitions: ColumnDefinition<FieldMetadata>[];
  viewFields: ViewField[];
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

      if (!correspondingColumnDefinition) return null;

      const { isLabelIdentifier } = correspondingColumnDefinition;

      if (isLabelIdentifier) {
        labelIdentifierFieldMetadataId =
          correspondingColumnDefinition.fieldMetadataId;
      }

      return {
        fieldMetadataId: viewField.fieldMetadataId,
        label: correspondingColumnDefinition.label,
        metadata: correspondingColumnDefinition.metadata,
        infoTooltipContent: correspondingColumnDefinition.infoTooltipContent,
        iconName: correspondingColumnDefinition.iconName,
        type: correspondingColumnDefinition.type,
        position: isLabelIdentifier ? 0 : viewField.position,
        size: viewField.size ?? correspondingColumnDefinition.size,
        isLabelIdentifier,
        isVisible: isLabelIdentifier || viewField.isVisible,
        viewFieldId: viewField.id,
      };
    })
    .filter(assertNotNull);

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
