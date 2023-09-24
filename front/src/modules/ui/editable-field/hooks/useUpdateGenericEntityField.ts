import { useContext } from 'react';

import { EditableFieldMutationContext } from '../contexts/EditableFieldMutationContext';
import { FieldDefinition } from '../types/FieldDefinition';
import {
  type FieldBooleanMetadata,
  type FieldBooleanValue,
  type FieldChipMetadata,
  type FieldChipValue,
  type FieldDateMetadata,
  type FieldDateValue,
  type FieldDoubleTextChipMetadata,
  type FieldDoubleTextChipValue,
  type FieldDoubleTextMetadata,
  type FieldDoubleTextValue,
  type FieldMetadata,
  type FieldNumberMetadata,
  type FieldNumberValue,
  type FieldPhoneMetadata,
  type FieldPhoneValue,
  type FieldProbabilityMetadata,
  type FieldProbabilityValue,
  type FieldRelationMetadata,
  type FieldRelationValue,
  type FieldTextMetadata,
  type FieldTextValue,
  type FieldURLMetadata,
  type FieldURLValue,
} from '../types/FieldMetadata';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldBooleanValue } from '../types/guards/isFieldBooleanValue';
import { isFieldChip } from '../types/guards/isFieldChip';
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

export const useUpdateGenericEntityField = () => {
  const useUpdateEntityMutation = useContext(EditableFieldMutationContext);

  const [updateEntity] = useUpdateEntityMutation();

  const updateEntityField = <
    ValueType extends FieldMetadata extends FieldDoubleTextMetadata
      ? FieldDoubleTextValue
      : FieldMetadata extends FieldTextMetadata
      ? FieldTextValue
      : FieldMetadata extends FieldPhoneMetadata
      ? FieldPhoneValue
      : FieldMetadata extends FieldURLMetadata
      ? FieldURLValue
      : FieldMetadata extends FieldNumberMetadata
      ? FieldNumberValue
      : FieldMetadata extends FieldDateMetadata
      ? FieldDateValue
      : FieldMetadata extends FieldChipMetadata
      ? FieldChipValue
      : FieldMetadata extends FieldDoubleTextChipMetadata
      ? FieldDoubleTextChipValue
      : FieldMetadata extends FieldRelationMetadata
      ? FieldRelationValue
      : FieldMetadata extends FieldProbabilityMetadata
      ? FieldProbabilityValue
      : FieldMetadata extends FieldBooleanMetadata
      ? FieldBooleanValue
      : unknown,
  >(
    currentEntityId: string,
    field: FieldDefinition<FieldMetadata>,
    newFieldValue: ValueType | null,
  ) => {
    // TODO: improve type guards organization, maybe with a common typeguard for all fields
    // taking an object of options as parameter ?
    //
    // The goal would be to check that the field value not only is valid,
    // but also that it is validated against the corresponding field type

    if (
      // Relation
      isFieldRelation(field) &&
      isFieldRelationValue(newFieldValue)
    ) {
      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: {
            [field.metadata.fieldName]: newFieldValue
              ? { connect: { id: newFieldValue.id } }
              : { disconnect: true },
          },
        },
      });
      return;
    }

    if (
      // Chip
      isFieldChip(field) &&
      isFieldChipValue(newFieldValue)
    ) {
      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [field.metadata.contentFieldName]: newFieldValue },
        },
      });
      return;
    }

    if (
      // Text
      (isFieldText(field) && isFieldTextValue(newFieldValue)) ||
      // Phone
      (isFieldPhone(field) && isFieldPhoneValue(newFieldValue)) ||
      // URL
      (isFieldURL(field) && isFieldURLValue(newFieldValue)) ||
      // Number
      (isFieldNumber(field) && isFieldNumberValue(newFieldValue)) ||
      // Date
      (isFieldDate(field) && isFieldDateValue(newFieldValue)) ||
      // Probability
      (isFieldProbability(field) && isFieldProbabilityValue(newFieldValue)) ||
      // Boolean
      (isFieldBoolean(field) && isFieldBooleanValue(newFieldValue))
    ) {
      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [field.metadata.fieldName]: newFieldValue },
        },
      });
      return;
    }

    if (
      // Double text
      (isFieldDoubleText(field) && isFieldDoubleTextValue(newFieldValue)) ||
      //  Double Text Chip
      (isFieldDoubleTextChip(field) &&
        isFieldDoubleTextChipValue(newFieldValue))
    ) {
      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: {
            [field.metadata.firstValueFieldName]: newFieldValue.firstValue,
            [field.metadata.secondValueFieldName]: newFieldValue.secondValue,
          },
        },
      });
    }
  };

  return updateEntityField;
};
