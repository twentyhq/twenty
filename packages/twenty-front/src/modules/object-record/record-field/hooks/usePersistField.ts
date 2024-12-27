import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldAddress } from '@/object-record/record-field/types/guards/isFieldAddress';
import { isFieldAddressValue } from '@/object-record/record-field/types/guards/isFieldAddressValue';
import { isFieldDate } from '@/object-record/record-field/types/guards/isFieldDate';
import { isFieldDateValue } from '@/object-record/record-field/types/guards/isFieldDateValue';
import { isFieldEmails } from '@/object-record/record-field/types/guards/isFieldEmails';
import { isFieldEmailsValue } from '@/object-record/record-field/types/guards/isFieldEmailsValue';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/types/guards/isFieldFullNameValue';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldLinksValue } from '@/object-record/record-field/types/guards/isFieldLinksValue';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect';
import { isFieldMultiSelectValue } from '@/object-record/record-field/types/guards/isFieldMultiSelectValue';
import { isFieldPhones } from '@/object-record/record-field/types/guards/isFieldPhones';
import { isFieldPhonesValue } from '@/object-record/record-field/types/guards/isFieldPhonesValue';
import { isFieldRawJson } from '@/object-record/record-field/types/guards/isFieldRawJson';
import { isFieldRawJsonValue } from '@/object-record/record-field/types/guards/isFieldRawJsonValue';
import { isFieldRelationToOneObject } from '@/object-record/record-field/types/guards/isFieldRelationToOneObject';
import { isFieldRelationToOneValue } from '@/object-record/record-field/types/guards/isFieldRelationToOneValue';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { isFieldSelectValue } from '@/object-record/record-field/types/guards/isFieldSelectValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';

import { isFieldArray } from '@/object-record/record-field/types/guards/isFieldArray';
import { isFieldArrayValue } from '@/object-record/record-field/types/guards/isFieldArrayValue';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { isFieldRichTextValue } from '@/object-record/record-field/types/guards/isFieldRichTextValue';
import { FieldContext } from '../contexts/FieldContext';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldBooleanValue } from '../types/guards/isFieldBooleanValue';
import { isFieldCurrency } from '../types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '../types/guards/isFieldCurrencyValue';
import { isFieldDateTime } from '../types/guards/isFieldDateTime';
import { isFieldDateTimeValue } from '../types/guards/isFieldDateTimeValue';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldNumberValue } from '../types/guards/isFieldNumberValue';
import { isFieldRating } from '../types/guards/isFieldRating';
import { isFieldRatingValue } from '../types/guards/isFieldRatingValue';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldTextValue } from '../types/guards/isFieldTextValue';

export const usePersistField = () => {
  const {
    recordId,
    fieldDefinition,
    useUpdateRecord = () => [],
  } = useContext(FieldContext);

  const [updateRecord] = useUpdateRecord();

  const persistField = useRecoilCallback(
    ({ set }) =>
      (valueToPersist: unknown) => {
        const fieldIsRelationToOneObject =
          isFieldRelationToOneObject(
            fieldDefinition as FieldDefinition<FieldRelationMetadata>,
          ) && isFieldRelationToOneValue(valueToPersist);

        const fieldIsText =
          isFieldText(fieldDefinition) && isFieldTextValue(valueToPersist);

        const fieldIsEmails =
          isFieldEmails(fieldDefinition) && isFieldEmailsValue(valueToPersist);

        const fieldIsDateTime =
          isFieldDateTime(fieldDefinition) &&
          isFieldDateTimeValue(valueToPersist);

        const fieldIsDate =
          isFieldDate(fieldDefinition) && isFieldDateValue(valueToPersist);

        const fieldIsLinks =
          isFieldLinks(fieldDefinition) && isFieldLinksValue(valueToPersist);

        const fieldIsBoolean =
          isFieldBoolean(fieldDefinition) &&
          isFieldBooleanValue(valueToPersist);

        const fieldIsRating =
          isFieldRating(fieldDefinition) && isFieldRatingValue(valueToPersist);

        const fieldIsNumber =
          isFieldNumber(fieldDefinition) && isFieldNumberValue(valueToPersist);

        const fieldIsCurrency =
          isFieldCurrency(fieldDefinition) &&
          isFieldCurrencyValue(valueToPersist);

        const fieldIsFullName =
          isFieldFullName(fieldDefinition) &&
          isFieldFullNameValue(valueToPersist);

        const fieldIsPhones =
          isFieldPhones(fieldDefinition) && isFieldPhonesValue(valueToPersist);

        const fieldIsSelect =
          isFieldSelect(fieldDefinition) && isFieldSelectValue(valueToPersist);

        const fieldIsMultiSelect =
          isFieldMultiSelect(fieldDefinition) &&
          isFieldMultiSelectValue(valueToPersist);

        const fieldIsAddress =
          isFieldAddress(fieldDefinition) &&
          isFieldAddressValue(valueToPersist);

        const fieldIsRawJson =
          isFieldRawJson(fieldDefinition) &&
          isFieldRawJsonValue(valueToPersist);

        const fieldIsRichText =
          isFieldRichText(fieldDefinition) &&
          isFieldRichTextValue(valueToPersist);

        const fieldIsArray =
          isFieldArray(fieldDefinition) && isFieldArrayValue(valueToPersist);

        const isValuePersistable =
          fieldIsRelationToOneObject ||
          fieldIsText ||
          fieldIsBoolean ||
          fieldIsEmails ||
          fieldIsRating ||
          fieldIsNumber ||
          fieldIsDateTime ||
          fieldIsDate ||
          fieldIsPhones ||
          fieldIsLinks ||
          fieldIsCurrency ||
          fieldIsFullName ||
          fieldIsSelect ||
          fieldIsMultiSelect ||
          fieldIsAddress ||
          fieldIsRawJson ||
          fieldIsArray ||
          fieldIsRichText;

        if (isValuePersistable) {
          const fieldName = fieldDefinition.metadata.fieldName;
          set(
            recordStoreFamilySelector({ recordId, fieldName }),
            valueToPersist,
          );

          if (fieldIsRelationToOneObject) {
            const value = valueToPersist as RecordForSelect;
            updateRecord?.({
              variables: {
                where: { id: recordId },
                updateOneRecordInput: {
                  [fieldName]: value,
                  [`${fieldName}Id`]: value?.id ?? null,
                },
              },
            });
            return;
          }

          updateRecord?.({
            variables: {
              where: { id: recordId },
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
    [recordId, fieldDefinition, updateRecord],
  );

  return persistField;
};
