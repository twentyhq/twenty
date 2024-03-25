import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/types/guards/isFieldCurrencyValue';
import { isFieldDateTime } from '@/object-record/record-field/types/guards/isFieldDateTime';
import { isFieldEmail } from '@/object-record/record-field/types/guards/isFieldEmail';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/types/guards/isFieldFullNameValue';
import { isFieldLink } from '@/object-record/record-field/types/guards/isFieldLink';
import { isFieldLinkValue } from '@/object-record/record-field/types/guards/isFieldLinkValue';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldRating } from '@/object-record/record-field/types/guards/isFieldRating';
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
    isFieldNumber(fieldDefinition) ||
    isFieldRating(fieldDefinition) ||
    isFieldEmail(fieldDefinition) ||
    isFieldBoolean(fieldDefinition) ||
    isFieldRelation(fieldDefinition)
    //|| isFieldPhone(fieldDefinition)
  ) {
    return isValueEmpty(fieldValue);
  }

  if (isFieldSelect(fieldDefinition)) {
    return (
      !isFieldSelectValue(fieldValue, selectOptionValues) ||
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

  throw new Error(
    `Entity field type not supported in isFieldValueEmpty : ${fieldDefinition.type}}`,
  );
};
