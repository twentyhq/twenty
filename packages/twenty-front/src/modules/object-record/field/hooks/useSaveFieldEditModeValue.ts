import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { entityFieldsEditModeValueFamilySelector } from '@/object-record/field/states/selectors/entityFieldsEditModeValueFamilySelector';
import { isFieldFullName } from '@/object-record/field/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/field/types/guards/isFieldFullNameValue';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldBooleanValue } from '../types/guards/isFieldBooleanValue';
import { isFieldCurrency } from '../types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '../types/guards/isFieldCurrencyValue';
import { isFieldDateTime } from '../types/guards/isFieldDateTime';
import { isFieldDateTimeValue } from '../types/guards/isFieldDateTimeValue';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldEmailValue } from '../types/guards/isFieldEmailValue';
import { isFieldLink } from '../types/guards/isFieldLink';
import { isFieldLinkValue } from '../types/guards/isFieldLinkValue';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldNumberValue } from '../types/guards/isFieldNumberValue';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldPhoneValue } from '../types/guards/isFieldPhoneValue';
import { isFieldRating } from '../types/guards/isFieldRating';
import { isFieldRatingValue } from '../types/guards/isFieldRatingValue';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldRelationValue } from '../types/guards/isFieldRelationValue';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldTextValue } from '../types/guards/isFieldTextValue';

export const useSaveFieldEditModeValue = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const saveFieldEditModeValue = useRecoilCallback(
    ({ set }) =>
      (currentValue: unknown) => {
        const fieldIsRelation =
          isFieldRelation(fieldDefinition) &&
          isFieldRelationValue(currentValue);

        const fieldIsText =
          isFieldText(fieldDefinition) && isFieldTextValue(currentValue);

        const fieldIsEmail =
          isFieldEmail(fieldDefinition) && isFieldEmailValue(currentValue);

        const fieldIsDateTime =
          isFieldDateTime(fieldDefinition) &&
          isFieldDateTimeValue(currentValue);

        const fieldIsLink =
          isFieldLink(fieldDefinition) && isFieldLinkValue(currentValue);

        const fieldIsBoolean =
          isFieldBoolean(fieldDefinition) && isFieldBooleanValue(currentValue);

        const fieldIsProbability =
          isFieldRating(fieldDefinition) && isFieldRatingValue(currentValue);

        const fieldIsNumber =
          isFieldNumber(fieldDefinition) && isFieldNumberValue(currentValue);

        const fieldIsCurrency =
          isFieldCurrency(fieldDefinition) &&
          isFieldCurrencyValue(currentValue);

        const fieldIsFullName =
          isFieldFullName(fieldDefinition) &&
          isFieldFullNameValue(currentValue);

        const fieldIsPhone =
          isFieldPhone(fieldDefinition) && isFieldPhoneValue(currentValue);

        if (fieldIsRelation) {
          const fieldName = fieldDefinition.metadata.fieldName;

          set(
            entityFieldsEditModeValueFamilySelector({ entityId, fieldName }),
            currentValue,
          );
        } else if (
          fieldIsText ||
          fieldIsBoolean ||
          fieldIsEmail ||
          fieldIsProbability ||
          fieldIsNumber ||
          fieldIsDateTime ||
          fieldIsPhone ||
          fieldIsLink ||
          fieldIsCurrency ||
          fieldIsFullName
        ) {
          const fieldName = fieldDefinition.metadata.fieldName;

          set(
            entityFieldsEditModeValueFamilySelector({ entityId, fieldName }),
            currentValue,
          );
        } else {
          throw new Error(
            `Invalid value to save: ${JSON.stringify(
              currentValue,
            )} for type : ${
              fieldDefinition.type
            }, type may not be implemented in useSaveFieldEditModeValue.`,
          );
        }
      },
    [entityId, fieldDefinition],
  );

  return saveFieldEditModeValue;
};
