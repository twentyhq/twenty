import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { assertNotNull } from '~/utils/assert';

import { ViewField } from '../types/ViewField';

export const mapViewFieldsToColumnDefinitions = ({
  columnDefinitions,
  objectMetadataItem,
  viewFields,
}: {
  columnDefinitions: ColumnDefinition<FieldMetadata>[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'labelIdentifierFieldMetadataId'
  >;
  viewFields: ViewField[];
}): ColumnDefinition<FieldMetadata>[] => {
  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);
  const labelIdentifierFieldMetadataId = labelIdentifierFieldMetadataItem?.id;

  const columnDefinitionsByFieldMetadataId = mapArrayToObject(
    columnDefinitions,
    ({ fieldMetadataId }) => fieldMetadataId,
  );

  const columnDefinitionsFromViewFields = viewFields
    .map((viewField) => {
      const correspondingColumnDefinition =
        columnDefinitionsByFieldMetadataId[viewField.fieldMetadataId];

      if (!correspondingColumnDefinition) return null;

      const isLabelIdentifier =
        viewField.fieldMetadataId === labelIdentifierFieldMetadataId;

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
  if (labelIdentifierIndex > -1) {
    return moveArrayItem(columnDefinitionsFromViewFields, {
      fromIndex: labelIdentifierIndex,
      toIndex: 0,
    });
  }

  // Label identifier field not found in view fields
  // => create column definition and add it at the start of the list
  const labelIdentifierColumnDefinition =
    columnDefinitionsByFieldMetadataId[labelIdentifierFieldMetadataId];

  return [
    {
      ...labelIdentifierColumnDefinition,
      isLabelIdentifier: true,
      position: 0,
      isVisible: true,
    },
    ...columnDefinitionsFromViewFields,
  ];
};
