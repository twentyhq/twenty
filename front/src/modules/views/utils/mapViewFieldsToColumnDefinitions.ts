import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';
import { assertNotNull } from '~/utils/assert';

import { ViewField } from '../types/ViewField';

export const mapViewFieldsToColumnDefinitions = (
  viewFields: ViewField[],
  fieldsMetadata: ColumnDefinition<FieldMetadata>[],
): ColumnDefinition<FieldMetadata>[] => {
  return viewFields
    .map((viewField) => {
      const correspondingFieldMetadata = fieldsMetadata.find(
        ({ fieldId }) => viewField.fieldId === fieldId,
      );

      return correspondingFieldMetadata
        ? {
            fieldId: viewField.fieldId,
            label: correspondingFieldMetadata.label,
            metadata: correspondingFieldMetadata.metadata,
            entityChipDisplayMapper:
              correspondingFieldMetadata.entityChipDisplayMapper,
            infoTooltipContent: correspondingFieldMetadata.infoTooltipContent,
            basePathToShowPage: correspondingFieldMetadata.basePathToShowPage,
            Icon: correspondingFieldMetadata.Icon,
            type: correspondingFieldMetadata.type,
            position: viewField.position,
            size: viewField.size ?? correspondingFieldMetadata.size,
            isVisible: viewField.isVisible,
            viewFieldId: viewField.id,
          }
        : null;
    })
    .filter(assertNotNull);
};
