import { useContext } from 'react';

import { isFieldChip } from '@/ui/editable-field/types/guards/isFieldChip';

import { EditableFieldMutationContext } from '../states/EditableFieldMutationContext';
import { FieldDefinition } from '../types/FieldDefinition';
import {
  FieldChipMetadata,
  FieldChipValue,
  FieldDateMetadata,
  FieldDateValue,
  FieldDoubleTextChipMetadata,
  FieldDoubleTextChipValue,
  FieldDoubleTextMetadata,
  FieldDoubleTextValue,
  FieldMetadata,
  FieldNumberMetadata,
  FieldNumberValue,
  FieldPhoneMetadata,
  FieldPhoneValue,
  FieldProbabilityMetadata,
  FieldProbabilityValue,
  FieldRelationMetadata,
  FieldRelationValue,
  FieldTextMetadata,
  FieldTextValue,
  FieldURLMetadata,
  FieldURLValue,
} from '../types/FieldMetadata';
import { isFieldChipValue } from '../types/guards/isFieldChipValue';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldDateValue } from '../types/guards/isFieldDateValue';
import { isFieldDoubleText } from '../types/guards/isFieldDoubleText';
import { isFieldDoubleTextChip } from '../types/guards/isFieldDoubleTextChip';
import { isFieldDoubleTextChipValue } from '../types/guards/isFieldDoubleTextChipValue';
import { isFieldDoubleTextValue } from '../types/guards/isFieldDoubleTextValue';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldNumberValue } from '../types/guards/isFieldNumberValue';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldPhoneValue } from '../types/guards/isFieldPhoneValue';
import { isFieldProbability } from '../types/guards/isFieldProbability';
import { isFieldProbabilityValue } from '../types/guards/isFieldProbabilityValue';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldRelationValue } from '../types/guards/isFieldRelationValue';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldTextValue } from '../types/guards/isFieldTextValue';
import { isFieldURL } from '../types/guards/isFieldURL';
import { isFieldURLValue } from '../types/guards/isFieldURLValue';

export function useUpdateGenericEntityField() {
  const useUpdateEntityMutation = useContext(EditableFieldMutationContext);

  const [updateEntity] = useUpdateEntityMutation();

  return function updateEntityField<
    MetadataType extends FieldMetadata,
    ValueType extends MetadataType extends FieldDoubleTextMetadata
      ? FieldDoubleTextValue
      : MetadataType extends FieldTextMetadata
      ? FieldTextValue
      : MetadataType extends FieldPhoneMetadata
      ? FieldPhoneValue
      : MetadataType extends FieldURLMetadata
      ? FieldURLValue
      : MetadataType extends FieldNumberMetadata
      ? FieldNumberValue
      : MetadataType extends FieldDateMetadata
      ? FieldDateValue
      : MetadataType extends FieldChipMetadata
      ? FieldChipValue
      : MetadataType extends FieldDoubleTextChipMetadata
      ? FieldDoubleTextChipValue
      : MetadataType extends FieldRelationMetadata
      ? FieldRelationValue
      : MetadataType extends FieldProbabilityMetadata
      ? FieldProbabilityValue
      : unknown,
  >(
    currentEntityId: string,
    field: FieldDefinition<MetadataType>,
    newFieldValue: ValueType,
  ) {
    const newFieldValueUnknown = newFieldValue as unknown;
    // TODO: improve type guards organization, maybe with a common typeguard for all fields
    // taking an object of options as parameter ?
    //
    // The goal would be to check that the field value not only is valid,
    // but also that it is validated against the corresponding field type

    // Relation
    if (isFieldRelation(field) && isFieldRelationValue(newFieldValueUnknown)) {
      const newSelectedEntity = newFieldValueUnknown;

      const fieldName = field.metadata.fieldName;

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
    } else if (isFieldChip(field) && isFieldChipValue(newFieldValueUnknown)) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [field.metadata.contentFieldName]: newContent },
        },
      });
      // Text
    } else if (isFieldText(field) && isFieldTextValue(newFieldValueUnknown)) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [field.metadata.fieldName]: newContent },
        },
      });
      // Double text
    } else if (
      isFieldDoubleText(field) &&
      isFieldDoubleTextValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: {
            [field.metadata.firstValueFieldName]: newContent.firstValue,
            [field.metadata.secondValueFieldName]: newContent.secondValue,
          },
        },
      });
      //  Double Text Chip
    } else if (
      isFieldDoubleTextChip(field) &&
      isFieldDoubleTextChipValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: {
            [field.metadata.firstValueFieldName]: newContent.firstValue,
            [field.metadata.secondValueFieldName]: newContent.secondValue,
          },
        },
      });
      // Phone
    } else if (isFieldPhone(field) && isFieldPhoneValue(newFieldValueUnknown)) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [field.metadata.fieldName]: newContent },
        },
      });
      // URL
    } else if (isFieldURL(field) && isFieldURLValue(newFieldValueUnknown)) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [field.metadata.fieldName]: newContent },
        },
      });
      // Number
    } else if (
      isFieldNumber(field) &&
      isFieldNumberValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [field.metadata.fieldName]: newContent },
        },
      });
      // Date
    } else if (isFieldDate(field) && isFieldDateValue(newFieldValueUnknown)) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [field.metadata.fieldName]: newContent },
        },
      });
    } else if (
      isFieldProbability(field) &&
      isFieldProbabilityValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [field.metadata.fieldName]: newContent },
        },
      });
    }
  };
}
