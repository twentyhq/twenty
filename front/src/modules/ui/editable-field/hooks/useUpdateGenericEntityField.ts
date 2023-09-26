import { useContext } from 'react';

import { FieldDefinition } from '../../field/types/FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldBooleanValue,
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
} from '../../field/types/FieldMetadata';
import { isFieldBoolean } from '../../field/types/guards/isFieldBoolean';
import { isFieldBooleanValue } from '../../field/types/guards/isFieldBooleanValue';
import { isFieldChip } from '../../field/types/guards/isFieldChip';
import { isFieldChipValue } from '../../field/types/guards/isFieldChipValue';
import { isFieldDate } from '../../field/types/guards/isFieldDate';
import { isFieldDateValue } from '../../field/types/guards/isFieldDateValue';
import { isFieldDoubleText } from '../../field/types/guards/isFieldDoubleText';
import { isFieldDoubleTextChip } from '../../field/types/guards/isFieldDoubleTextChip';
import { isFieldDoubleTextChipValue } from '../../field/types/guards/isFieldDoubleTextChipValue';
import { isFieldDoubleTextValue } from '../../field/types/guards/isFieldDoubleTextValue';
import { isFieldNumber } from '../../field/types/guards/isFieldNumber';
import { isFieldNumberValue } from '../../field/types/guards/isFieldNumberValue';
import { isFieldPhone } from '../../field/types/guards/isFieldPhone';
import { isFieldPhoneValue } from '../../field/types/guards/isFieldPhoneValue';
import { isFieldProbability } from '../../field/types/guards/isFieldProbability';
import { isFieldProbabilityValue } from '../../field/types/guards/isFieldProbabilityValue';
import { isFieldRelation } from '../../field/types/guards/isFieldRelation';
import { isFieldRelationValue } from '../../field/types/guards/isFieldRelationValue';
import { isFieldText } from '../../field/types/guards/isFieldText';
import { isFieldTextValue } from '../../field/types/guards/isFieldTextValue';
import { isFieldURL } from '../../field/types/guards/isFieldURL';
import { isFieldURLValue } from '../../field/types/guards/isFieldURLValue';
import { EditableFieldMutationContext } from '../contexts/EditableFieldMutationContext';

export const useUpdateGenericEntityField = () => {
  const updateEntity = useContext(EditableFieldMutationContext);

  // const updateEntity = useUpdateEntityMutation;

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
