import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldAddress } from '@/object-record/record-field/types/guards/isFieldAddress';
import { isFieldAddressValue } from '@/object-record/record-field/types/guards/isFieldAddressValue';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/types/guards/isFieldCurrencyValue';
import { isFieldDate } from '@/object-record/record-field/types/guards/isFieldDate';
import { isFieldDateTime } from '@/object-record/record-field/types/guards/isFieldDateTime';
import { isFieldEmail } from '@/object-record/record-field/types/guards/isFieldEmail';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/types/guards/isFieldFullNameValue';
import { isFieldLink } from '@/object-record/record-field/types/guards/isFieldLink';
import { isFieldLinkValue } from '@/object-record/record-field/types/guards/isFieldLinkValue';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect';
import { isFieldMultiSelectValue } from '@/object-record/record-field/types/guards/isFieldMultiSelectValue';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldPhone } from '@/object-record/record-field/types/guards/isFieldPhone';
import { isFieldRating } from '@/object-record/record-field/types/guards/isFieldRating';
import { isFieldRawJson } from '@/object-record/record-field/types/guards/isFieldRawJson';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { isFieldSelectValue } from '@/object-record/record-field/types/guards/isFieldSelectValue';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { isFieldUuid } from '@/object-record/record-field/types/guards/isFieldUuid';
import { isDefined } from '~/utils/isDefined';

const isValueEmpty = (value: unknown) => !isDefined(value) || value === '';

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
    isFieldEmail(fieldDefinition) ||
    isFieldBoolean(fieldDefinition) ||
    isFieldRelation(fieldDefinition) ||
    isFieldRawJson(fieldDefinition) ||
    isFieldPhone(fieldDefinition)
  ) {
    return isValueEmpty(fieldValue);
  }

  if (isFieldSelect(fieldDefinition)) {
    return (
      !isFieldSelectValue(fieldValue, selectOptionValues) ||
      !isDefined(fieldValue)
    );
  }

  if (isFieldMultiSelect(fieldDefinition)) {
    return (
      !isFieldMultiSelectValue(fieldValue, selectOptionValues) ||
      !isDefined(fieldValue)
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
      isValueEmpty(fieldValue?.firstName + fieldValue?.lastName)
    );
  }

  if (isFieldLink(fieldDefinition)) {
    return !isFieldLinkValue(fieldValue) || isValueEmpty(fieldValue?.url);
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

  throw new Error(
    `Entity field type not supported in isFieldValueEmpty : ${fieldDefinition.type}}`,
  );
};
