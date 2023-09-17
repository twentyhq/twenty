import { useContext } from 'react';

import { isViewFieldBoolean } from '@/ui/editable-field/types/guards/isViewFieldBoolean';
import { isViewFieldBooleanValue } from '@/ui/editable-field/types/guards/isViewFieldBooleanValue';
import { isViewFieldChip } from '@/ui/editable-field/types/guards/isViewFieldChip';
import { isViewFieldChipValue } from '@/ui/editable-field/types/guards/isViewFieldChipValue';
import { isViewFieldDate } from '@/ui/editable-field/types/guards/isViewFieldDate';
import { isViewFieldDateValue } from '@/ui/editable-field/types/guards/isViewFieldDateValue';
import { isViewFieldDoubleText } from '@/ui/editable-field/types/guards/isViewFieldDoubleText';
import { isViewFieldDoubleTextChip } from '@/ui/editable-field/types/guards/isViewFieldDoubleTextChip';
import { isViewFieldDoubleTextChipValue } from '@/ui/editable-field/types/guards/isViewFieldDoubleTextChipValue';
import { isViewFieldDoubleTextValue } from '@/ui/editable-field/types/guards/isViewFieldDoubleTextValue';
import { isViewFieldEmail } from '@/ui/editable-field/types/guards/isViewFieldEmail';
import { isViewFieldEmailValue } from '@/ui/editable-field/types/guards/isViewFieldEmailValue';
import { isViewFieldMoney } from '@/ui/editable-field/types/guards/isViewFieldMoney';
import { isViewFieldMoneyValue } from '@/ui/editable-field/types/guards/isViewFieldMoneyValue';
import { isViewFieldNumber } from '@/ui/editable-field/types/guards/isViewFieldNumber';
import { isViewFieldNumberValue } from '@/ui/editable-field/types/guards/isViewFieldNumberValue';
import { isViewFieldPhone } from '@/ui/editable-field/types/guards/isViewFieldPhone';
import { isViewFieldPhoneValue } from '@/ui/editable-field/types/guards/isViewFieldPhoneValue';
import { isViewFieldRelation } from '@/ui/editable-field/types/guards/isViewFieldRelation';
import { isViewFieldRelationValue } from '@/ui/editable-field/types/guards/isViewFieldRelationValue';
import { isViewFieldText } from '@/ui/editable-field/types/guards/isViewFieldText';
import { isViewFieldTextValue } from '@/ui/editable-field/types/guards/isViewFieldTextValue';
import { isViewFieldURL } from '@/ui/editable-field/types/guards/isViewFieldURL';
import { isViewFieldURLValue } from '@/ui/editable-field/types/guards/isViewFieldURLValue';
import type {
  ViewFieldChipMetadata,
  ViewFieldChipValue,
  ViewFieldDateMetadata,
  ViewFieldDateValue,
  ViewFieldDoubleTextChipMetadata,
  ViewFieldDoubleTextChipValue,
  ViewFieldDoubleTextMetadata,
  ViewFieldDoubleTextValue,
  ViewFieldMetadata,
  ViewFieldNumberMetadata,
  ViewFieldNumberValue,
  ViewFieldPhoneMetadata,
  ViewFieldPhoneValue,
  ViewFieldRelationMetadata,
  ViewFieldRelationValue,
  ViewFieldTextMetadata,
  ViewFieldTextValue,
  ViewFieldURLMetadata,
  ViewFieldURLValue,
} from '@/ui/editable-field/types/ViewField';

import { EntityUpdateMutationContext } from '../contexts/EntityUpdateMutationHookContext';
import type { ColumnDefinition } from '../types/ColumnDefinition';

export const useUpdateEntityField = () => {
  const updateEntity = useContext(EntityUpdateMutationContext);

  const updateEntityField = <
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
      : unknown,
  >(
    currentEntityId: string,
    columnDefinition: ColumnDefinition<MetadataType>,
    newFieldValue: ValueType | null,
  ) => {
    // TODO: improve type guards organization, maybe with a common typeguard for all view fields
    //    taking an object of options as parameter ?
    //
    // The goal would be to check that the view field value not only is valid,
    //    but also that it is validated against the corresponding view field type

    if (
      // Relation
      isViewFieldRelation(columnDefinition) &&
      isViewFieldRelationValue(newFieldValue)
    ) {
      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: {
            [columnDefinition.metadata.fieldName]:
              !newFieldValue || newFieldValue.id === ''
                ? { disconnect: true }
                : { connect: { id: newFieldValue.id } },
          },
        },
      });
      return;
    }

    if (
      // Chip
      isViewFieldChip(columnDefinition) &&
      isViewFieldChipValue(newFieldValue)
    ) {
      const newContent = newFieldValue;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [columnDefinition.metadata.contentFieldName]: newContent },
        },
      });
      return;
    }

    if (
      // Text
      (isViewFieldText(columnDefinition) &&
        isViewFieldTextValue(newFieldValue)) ||
      // Phone
      (isViewFieldPhone(columnDefinition) &&
        isViewFieldPhoneValue(newFieldValue)) ||
      // Email
      (isViewFieldEmail(columnDefinition) &&
        isViewFieldEmailValue(newFieldValue)) ||
      // URL
      (isViewFieldURL(columnDefinition) &&
        isViewFieldURLValue(newFieldValue)) ||
      // Number
      (isViewFieldNumber(columnDefinition) &&
        isViewFieldNumberValue(newFieldValue)) ||
      // Boolean
      (isViewFieldBoolean(columnDefinition) &&
        isViewFieldBooleanValue(newFieldValue)) ||
      // Money
      (isViewFieldMoney(columnDefinition) &&
        isViewFieldMoneyValue(newFieldValue)) ||
      // Date
      (isViewFieldDate(columnDefinition) && isViewFieldDateValue(newFieldValue))
    ) {
      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [columnDefinition.metadata.fieldName]: newFieldValue },
        },
      });
      return;
    }

    if (
      // Double text
      (isViewFieldDoubleText(columnDefinition) &&
        isViewFieldDoubleTextValue(newFieldValue)) ||
      //  Double Text Chip
      (isViewFieldDoubleTextChip(columnDefinition) &&
        isViewFieldDoubleTextChipValue(newFieldValue))
    ) {
      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: {
            [columnDefinition.metadata.firstValueFieldName]:
              newFieldValue.firstValue,
            [columnDefinition.metadata.secondValueFieldName]:
              newFieldValue.secondValue,
          },
        },
      });
    }
  };

  return updateEntityField;
};
