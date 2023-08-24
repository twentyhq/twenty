import { useContext } from 'react';

import { isViewFieldBoolean } from '@/ui/editable-field/types/guards/isViewFieldBoolean';
import { isViewFieldBooleanValue } from '@/ui/editable-field/types/guards/isViewFieldBooleanValue';
import { isViewFieldChip } from '@/ui/editable-field/types/guards/isViewFieldChip';
import { isViewFieldDate } from '@/ui/editable-field/types/guards/isViewFieldDate';
import { isViewFieldDateValue } from '@/ui/editable-field/types/guards/isViewFieldDateValue';
import { isViewFieldDoubleText } from '@/ui/editable-field/types/guards/isViewFieldDoubleText';
import { isViewFieldDoubleTextChip } from '@/ui/editable-field/types/guards/isViewFieldDoubleTextChip';
import { isViewFieldDoubleTextChipValue } from '@/ui/editable-field/types/guards/isViewFieldDoubleTextChipValue';
import { isViewFieldDoubleTextValue } from '@/ui/editable-field/types/guards/isViewFieldDoubleTextValue';
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

import { isViewFieldChipValue } from '../../editable-field/types/guards/isViewFieldChipValue';
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
  ViewFieldRelationMetadata,
  ViewFieldRelationValue,
  ViewFieldTextMetadata,
  ViewFieldTextValue,
  ViewFieldURLMetadata,
  ViewFieldURLValue,
} from '../../editable-field/types/ViewField';
import { EntityUpdateMutationContext } from '../contexts/EntityUpdateMutationHookContext';

export function useUpdateEntityField() {
  const updateEntity = useContext(EntityUpdateMutationContext);

  return function updateEntityField<
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
      // Boolean
    } else if (
      isViewFieldBoolean(viewField) &&
      isViewFieldBooleanValue(newFieldValueUnknown)
    ) {
      const newContent = newFieldValueUnknown;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [viewField.metadata.fieldName]: newContent },
        },
      });
      // Money
    } else if (
      isViewFieldMoney(viewField) &&
      isViewFieldMoneyValue(newFieldValueUnknown)
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
    }
  };
}
