import { BoardFieldDefinition } from '@/ui/layout/board/types/BoardFieldDefinition';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { assertNotNull } from '~/utils/assert';

import { ViewField } from '../types/ViewField';

export const viewFieldsToBoardFieldDefinitions = (
  viewFields: ViewField[],
  fieldsMetadata: BoardFieldDefinition<FieldMetadata>[],
): BoardFieldDefinition<FieldMetadata>[] => {
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
            isVisible: viewField.isVisible,
            viewFieldId: viewField.id,
          }
        : null;
    })
    .filter(assertNotNull);
};
