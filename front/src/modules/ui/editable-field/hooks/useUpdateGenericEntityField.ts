import { useContext } from 'react';

import { isViewFieldChip } from '@/ui/editable-field/types/guards/isViewFieldChip';
import { EntityUpdateMutationHookContext } from '@/ui/table/states/EntityUpdateMutationHookContext';

import { isViewFieldChipValue } from '../types/guards/isViewFieldChipValue';
import { isViewFieldDate } from '../types/guards/isViewFieldDate';
import { isViewFieldDateValue } from '../types/guards/isViewFieldDateValue';
import { isViewFieldDoubleText } from '../types/guards/isViewFieldDoubleText';
import { isViewFieldDoubleTextChip } from '../types/guards/isViewFieldDoubleTextChip';
import { isViewFieldDoubleTextChipValue } from '../types/guards/isViewFieldDoubleTextChipValue';
import { isViewFieldDoubleTextValue } from '../types/guards/isViewFieldDoubleTextValue';
import { isViewFieldNumber } from '../types/guards/isViewFieldNumber';
import { isViewFieldNumberValue } from '../types/guards/isViewFieldNumberValue';
import { isViewFieldPhone } from '../types/guards/isViewFieldPhone';
import { isViewFieldPhoneValue } from '../types/guards/isViewFieldPhoneValue';
import { isViewFieldProbability } from '../types/guards/isViewFieldProbability';
import { isViewFieldProbabilityValue } from '../types/guards/isViewFieldProbabilityValue';
import { isViewFieldRelation } from '../types/guards/isViewFieldRelation';
import { isViewFieldRelationValue } from '../types/guards/isViewFieldRelationValue';
import { isViewFieldText } from '../types/guards/isViewFieldText';
import { isViewFieldTextValue } from '../types/guards/isViewFieldTextValue';
import { isViewFieldURL } from '../types/guards/isViewFieldURL';
import { isViewFieldURLValue } from '../types/guards/isViewFieldURLValue';
import {
  ViewFieldChipMetadata,
  ViewFieldChipValue,
  ViewFieldDateMetadata,
  ViewFieldDateValue,
  ViewFieldDefinition,
  ViewFieldDoubleTextChipMetadata,
  ViewFieldDoubleTextChipValue,
  ViewFieldDoubleTextMetadata,
  ViewFieldDoubleTextValue,
  ViewFieldMetadata,
  ViewFieldNumberMetadata,
  ViewFieldNumberValue,
  ViewFieldPhoneMetadata,
  ViewFieldPhoneValue,
  ViewFieldProbabilityMetadata,
  ViewFieldProbabilityValue,
  ViewFieldRelationMetadata,
  ViewFieldRelationValue,
  ViewFieldTextMetadata,
  ViewFieldTextValue,
  ViewFieldURLMetadata,
  ViewFieldURLValue,
} from '../types/ViewField';

export function useUpdateGenericEntityField() {
  const useUpdateEntityMutation = useContext(EntityUpdateMutationHookContext);

  const [updateEntity] = useUpdateEntityMutation();

  return function updatePeopleField<
    MetadataType extends ViewFieldMetadata,
    ValueType extends MetadataType extends ViewFieldDoubleTextMetadata
      ? ViewFieldDoubleTextValue
      : MetadataType extends ViewFieldTextMetadata
      ? ViewFieldTextValue
      : MetadataType extends ViewFieldPhoneMetadata
      ? ViewFieldPhoneValue
      : MetadataType extends ViewFieldURLMetadata
      ? ViewFieldURLValue
      : MetadataType extends ViewFieldNumberMetadata
      ? ViewFieldNumberValue
      : MetadataType extends ViewFieldDateMetadata
      ? ViewFieldDateValue
      : MetadataType extends ViewFieldChipMetadata
      ? ViewFieldChipValue
      : MetadataType extends ViewFieldDoubleTextChipMetadata
      ? ViewFieldDoubleTextChipValue
      : MetadataType extends ViewFieldRelationMetadata
      ? ViewFieldRelationValue
      : MetadataType extends ViewFieldProbabilityMetadata
      ? ViewFieldProbabilityValue
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

    // Relation
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
      // Chip
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
      // Text
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
      // Double text
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
      //  Double Text Chip
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
      // Phone
    } else if (
      isViewFieldPhone(viewField) &&
      isViewFieldPhoneValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [viewField.metadata.fieldName]: newContent },
        },
      });
      // URL
    } else if (
      isViewFieldURL(viewField) &&
      isViewFieldURLValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [viewField.metadata.fieldName]: newContent },
        },
      });
      // Number
    } else if (
      isViewFieldNumber(viewField) &&
      isViewFieldNumberValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [viewField.metadata.fieldName]: newContent },
        },
      });
      // Date
    } else if (
      isViewFieldDate(viewField) &&
      isViewFieldDateValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [viewField.metadata.fieldName]: newContent },
        },
      });
    } else if (
      isViewFieldProbability(viewField) &&
      isViewFieldProbabilityValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [viewField.metadata.fieldName]: newContent },
        },
      });
    }
  };
}
