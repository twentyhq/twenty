import { isArray, isNonEmptyArray, isString } from '@sniptt/guards';

import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldActorValue } from '@/object-record/record-field/types/guards/isFieldActorValue';
import { isFieldAddress } from '@/object-record/record-field/types/guards/isFieldAddress';
import { isFieldAddressValue } from '@/object-record/record-field/types/guards/isFieldAddressValue';
import { isFieldArray } from '@/object-record/record-field/types/guards/isFieldArray';
import { isFieldArrayValue } from '@/object-record/record-field/types/guards/isFieldArrayValue';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/types/guards/isFieldCurrencyValue';
import { isFieldDate } from '@/object-record/record-field/types/guards/isFieldDate';
import { isFieldDateTime } from '@/object-record/record-field/types/guards/isFieldDateTime';
import { isFieldEmails } from '@/object-record/record-field/types/guards/isFieldEmails';
import { isFieldEmailsValue } from '@/object-record/record-field/types/guards/isFieldEmailsValue';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/types/guards/isFieldFullNameValue';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldLinksValue } from '@/object-record/record-field/types/guards/isFieldLinksValue';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect';
import { isFieldMultiSelectValue } from '@/object-record/record-field/types/guards/isFieldMultiSelectValue';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldPhones } from '@/object-record/record-field/types/guards/isFieldPhones';
import { isFieldPhonesValue } from '@/object-record/record-field/types/guards/isFieldPhonesValue';
import { isFieldPosition } from '@/object-record/record-field/types/guards/isFieldPosition';
import { isFieldRating } from '@/object-record/record-field/types/guards/isFieldRating';
import { isFieldRawJson } from '@/object-record/record-field/types/guards/isFieldRawJson';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { isFieldSelectValue } from '@/object-record/record-field/types/guards/isFieldSelectValue';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { isFieldTsVector } from '@/object-record/record-field/types/guards/isFieldTsVectorValue';
import { isFieldUuid } from '@/object-record/record-field/types/guards/isFieldUuid';
import { isDefined } from '~/utils/isDefined';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

const isValueEmpty = (value: unknown) =>
  !isDefined(value) ||
  (isString(value) && stripSimpleQuotesFromString(value) === '');

export const isFieldValueEmpty = ({
  fieldDefinition,
  fieldValue,
  selectOptionValues,
}: {
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type'>;
  fieldValue: unknown;
  selectOptionValues?: string[];
}) => {
  if (
    isFieldUuid(fieldDefinition) ||
    isFieldText(fieldDefinition) ||
    isFieldDateTime(fieldDefinition) ||
    isFieldDate(fieldDefinition) ||
    isFieldNumber(fieldDefinition) ||
    isFieldRating(fieldDefinition) ||
    isFieldBoolean(fieldDefinition) ||
    isFieldRawJson(fieldDefinition) ||
    isFieldRichText(fieldDefinition) ||
    isFieldPosition(fieldDefinition)
  ) {
    return isValueEmpty(fieldValue);
  }

  if (isFieldSelect(fieldDefinition)) {
    return (
      !isFieldSelectValue(fieldValue, selectOptionValues) ||
      !isDefined(fieldValue)
    );
  }

  if (isFieldRelation(fieldDefinition)) {
    if (isArray(fieldValue)) {
      return !isNonEmptyArray(fieldValue);
    }
    return isValueEmpty(fieldValue);
  }

  if (isFieldMultiSelect(fieldDefinition) || isFieldArray(fieldDefinition)) {
    return (
      !isFieldArrayValue(fieldValue) ||
      !isFieldMultiSelectValue(fieldValue, selectOptionValues) ||
      !isDefined(fieldValue) ||
      !isNonEmptyArray(fieldValue)
    );
  }

  if (isFieldCurrency(fieldDefinition)) {
    return (
      !isFieldCurrencyValue(fieldValue) ||
      isValueEmpty(fieldValue?.amountMicros)
    );
  }

  if (isFieldFullName(fieldDefinition)) {
    return (
      !isFieldFullNameValue(fieldValue) ||
      (isValueEmpty(fieldValue?.firstName) &&
        isValueEmpty(fieldValue?.lastName))
    );
  }

  if (isFieldAddress(fieldDefinition)) {
    return (
      !isFieldAddressValue(fieldValue) ||
      (isValueEmpty(fieldValue?.addressStreet1) &&
        isValueEmpty(fieldValue?.addressStreet2) &&
        isValueEmpty(fieldValue?.addressCity) &&
        isValueEmpty(fieldValue?.addressState) &&
        isValueEmpty(fieldValue?.addressPostcode) &&
        isValueEmpty(fieldValue?.addressCountry))
    );
  }

  if (isFieldLinks(fieldDefinition)) {
    return (
      !isFieldLinksValue(fieldValue) || isValueEmpty(fieldValue.primaryLinkUrl)
    );
  }

  if (isFieldActor(fieldDefinition)) {
    return !isFieldActorValue(fieldValue) || isValueEmpty(fieldValue.name);
  }

  if (isFieldEmails(fieldDefinition)) {
    return (
      !isFieldEmailsValue(fieldValue) || isValueEmpty(fieldValue.primaryEmail)
    );
  }

  if (isFieldPhones(fieldDefinition)) {
    return (
      !isFieldPhonesValue(fieldValue) ||
      isValueEmpty(fieldValue.primaryPhoneNumber)
    );
  }

  if (isFieldTsVector(fieldDefinition)) {
    return false;
  }

  throw new Error(
    `Entity field type not supported in isFieldValueEmpty : ${fieldDefinition.type}}`,
  );
};
