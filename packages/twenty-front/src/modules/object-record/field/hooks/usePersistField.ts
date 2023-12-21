import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { isFieldFullName } from '@/object-record/field/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/field/types/guards/isFieldFullNameValue';

import { FieldContext } from '../contexts/FieldContext';
import { entityFieldsFamilySelector } from '../states/selectors/entityFieldsFamilySelector';
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

export const usePersistField = () => {
  const {
    entityId,
    fieldDefinition,
    useUpdateRecord = () => [],
  } = useContext(FieldContext);

  const [updateRecord] = useUpdateRecord();

  const persistField = useRecoilCallback(
    ({ set }) =>
      (valueToPersist: unknown) => {
        const fieldIsRelation =
          isFieldRelation(fieldDefinition) &&
          isFieldRelationValue(valueToPersist);

        const fieldIsText =
          isFieldText(fieldDefinition) && isFieldTextValue(valueToPersist);

        const fieldIsEmail =
          isFieldEmail(fieldDefinition) && isFieldEmailValue(valueToPersist);

        const fieldIsDateTime =
          isFieldDateTime(fieldDefinition) &&
          isFieldDateTimeValue(valueToPersist);

        const fieldIsLink =
          isFieldLink(fieldDefinition) && isFieldLinkValue(valueToPersist);

        const fieldIsBoolean =
          isFieldBoolean(fieldDefinition) &&
          isFieldBooleanValue(valueToPersist);

        const fieldIsProbability =
          isFieldRating(fieldDefinition) && isFieldRatingValue(valueToPersist);

        const fieldIsNumber =
          isFieldNumber(fieldDefinition) && isFieldNumberValue(valueToPersist);

        const fieldIsCurrency =
          isFieldCurrency(fieldDefinition) &&
          isFieldCurrencyValue(valueToPersist);

        const fieldIsFullName =
          isFieldFullName(fieldDefinition) &&
          isFieldFullNameValue(valueToPersist);

        const fieldIsPhone =
          isFieldPhone(fieldDefinition) && isFieldPhoneValue(valueToPersist);

        if (fieldIsRelation) {
          const fieldName = fieldDefinition.metadata.fieldName;

          set(
            entityFieldsFamilySelector({ entityId, fieldName }),
            valueToPersist,
          );

          updateRecord?.({
            variables: {
              where: { id: entityId },
              updateOneRecordInput: {
                [`${fieldName}Id`]: valueToPersist?.id ?? null,
                [`${fieldName}`]: valueToPersist ?? null,
              },
            },
          });
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
            entityFieldsFamilySelector({ entityId, fieldName }),
            valueToPersist,
          );

          updateRecord?.({
            variables: {
              where: { id: entityId },
              updateOneRecordInput: {
                [fieldName]: valueToPersist,
              },
            },
          });
        } else {
          throw new Error(
            `Invalid value to persist: ${JSON.stringify(
              valueToPersist,
            )} for type : ${
              fieldDefinition.type
            }, type may not be implemented in usePersistField.`,
          );
        }
      },
    [entityId, fieldDefinition, updateRecord],
  );

  return persistField;
};
