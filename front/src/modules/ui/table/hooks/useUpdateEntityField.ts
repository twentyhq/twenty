import { useContext } from 'react';

import { EntityUpdateMutationHookContext } from '@/ui/table/states/EntityUpdateMutationHookContext';
import { isViewFieldChip } from '@/ui/table/types/guards/isViewFieldChip';
import { isViewFieldRelation } from '@/ui/table/types/guards/isViewFieldRelation';
import { isViewFieldText } from '@/ui/table/types/guards/isViewFieldText';

import { isViewFieldChipValue } from '../types/guards/isViewFieldChipValue';
import { isViewFieldDoubleText } from '../types/guards/isViewFieldDoubleText';
import { isViewFieldDoubleTextChip } from '../types/guards/isViewFieldDoubleTextChip';
import { isViewFieldDoubleTextChipValue } from '../types/guards/isViewFieldDoubleTextChipValue';
import { isViewFieldDoubleTextValue } from '../types/guards/isViewFieldDoubleTextValue';
import { isViewFieldRelationValue } from '../types/guards/isViewFieldRelationValue';
import { isViewFieldTextValue } from '../types/guards/isViewFieldTextValue';
import {
  ViewFieldChipMetadata,
  ViewFieldChipValue,
  ViewFieldDefinition,
  ViewFieldDoubleTextChipMetadata,
  ViewFieldDoubleTextChipValue,
  ViewFieldDoubleTextMetadata,
  ViewFieldDoubleTextValue,
  ViewFieldMetadata,
  ViewFieldRelationMetadata,
  ViewFieldRelationValue,
  ViewFieldTextMetadata,
  ViewFieldTextValue,
} from '../types/ViewField';

export function useUpdateEntityField() {
  const useUpdateEntityMutation = useContext(EntityUpdateMutationHookContext);

  const [updateEntity] = useUpdateEntityMutation();

  return function updatePeopleField<
    MetadataType extends ViewFieldMetadata,
    ValueType extends MetadataType extends ViewFieldDoubleTextMetadata
      ? ViewFieldDoubleTextValue
      : MetadataType extends ViewFieldTextMetadata
      ? ViewFieldTextValue
      : MetadataType extends ViewFieldChipMetadata
      ? ViewFieldChipValue
      : MetadataType extends ViewFieldDoubleTextChipMetadata
      ? ViewFieldDoubleTextChipValue
      : MetadataType extends ViewFieldRelationMetadata
      ? ViewFieldRelationValue
      : unknown,
  >(
    currentEntityId: string,
    viewField: ViewFieldDefinition<MetadataType>,
    newFieldValue: ValueType,
  ) {
    const newFieldValueUnknown = newFieldValue as unknown;
    // TODO: improve type guards organization, maybe with a common typeguard for all view fields
    //    taking an object of options as parameter ?
    //
    // The goal would be to check that the view field value not only is valid,
    //    but also that it is validated against the corresponding view field type
    if (
      isViewFieldRelation(viewField) &&
      isViewFieldRelationValue(newFieldValueUnknown)
    ) {
      const newSelectedEntity = newFieldValueUnknown;

      const fieldName = viewField.metadata.fieldName;

      if (!newSelectedEntity) {
        updateEntity({
          variables: {
            where: { id: currentEntityId },
            data: {
              [fieldName]: {
                disconnect: true,
              },
            },
          },
        });
      } else {
        updateEntity({
          variables: {
            where: { id: currentEntityId },
            data: {
              [fieldName]: {
                connect: { id: newSelectedEntity.id },
              },
            },
          },
        });
      }
    } else if (
      isViewFieldChip(viewField) &&
      isViewFieldChipValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [viewField.metadata.contentFieldName]: newContent },
        },
      });
    } else if (
      isViewFieldText(viewField) &&
      isViewFieldTextValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [viewField.metadata.fieldName]: newContent },
        },
      });
    } else if (
      isViewFieldDoubleText(viewField) &&
      isViewFieldDoubleTextValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: {
            [viewField.metadata.firstValueFieldName]: newContent.firstValue,
            [viewField.metadata.secondValueFieldName]: newContent.secondValue,
          },
        },
      });
    } else if (
      isViewFieldDoubleTextChip(viewField) &&
      isViewFieldDoubleTextChipValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: {
            [viewField.metadata.firstValueFieldName]: newContent.firstValue,
            [viewField.metadata.secondValueFieldName]: newContent.secondValue,
          },
        },
      });
    }
  };
}
