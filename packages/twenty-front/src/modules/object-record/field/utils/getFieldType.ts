import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { FieldType } from '@/object-record/field/types/FieldType';
import { isFieldBoolean } from '@/object-record/field/types/guards/isFieldBoolean';
import { isFieldBooleanValue } from '@/object-record/field/types/guards/isFieldBooleanValue';
import { isFieldCurrency } from '@/object-record/field/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/field/types/guards/isFieldCurrencyValue';
import { isFieldDateTime } from '@/object-record/field/types/guards/isFieldDateTime';
import { isFieldDateTimeValue } from '@/object-record/field/types/guards/isFieldDateTimeValue';
import { isFieldEmail } from '@/object-record/field/types/guards/isFieldEmail';
import { isFieldEmailValue } from '@/object-record/field/types/guards/isFieldEmailValue';
import { isFieldFullName } from '@/object-record/field/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/field/types/guards/isFieldFullNameValue';
import { isFieldLink } from '@/object-record/field/types/guards/isFieldLink';
import { isFieldLinkValue } from '@/object-record/field/types/guards/isFieldLinkValue';
import { isFieldNumber } from '@/object-record/field/types/guards/isFieldNumber';
import { isFieldNumberValue } from '@/object-record/field/types/guards/isFieldNumberValue';
import { isFieldPhone } from '@/object-record/field/types/guards/isFieldPhone';
import { isFieldPhoneValue } from '@/object-record/field/types/guards/isFieldPhoneValue';
import { isFieldRating } from '@/object-record/field/types/guards/isFieldRating';
import { isFieldRatingValue } from '@/object-record/field/types/guards/isFieldRatingValue';
import { isFieldRelation } from '@/object-record/field/types/guards/isFieldRelation';
import { isFieldRelationValue } from '@/object-record/field/types/guards/isFieldRelationValue';
import { isFieldText } from '@/object-record/field/types/guards/isFieldText';
import { isFieldTextValue } from '@/object-record/field/types/guards/isFieldTextValue';

export const getFieldType = ({
  fieldDefinition,
  fieldValue,
}: {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  fieldValue: unknown;
}): FieldType | null => {
  if (isFieldRelation(fieldDefinition) && isFieldRelationValue(fieldValue)) {
    return 'RELATION';
  } else if (isFieldText(fieldDefinition) && isFieldTextValue(fieldValue)) {
    return 'TEXT';
  } else if (isFieldEmail(fieldDefinition) && isFieldEmailValue(fieldValue)) {
    return 'EMAIL';
  } else if (
    isFieldDateTime(fieldDefinition) &&
    isFieldDateTimeValue(fieldValue)
  ) {
    return 'DATE_TIME';
  } else if (isFieldLink(fieldDefinition) && isFieldLinkValue(fieldValue)) {
    return 'LINK';
  } else if (
    isFieldBoolean(fieldDefinition) &&
    isFieldBooleanValue(fieldValue)
  ) {
    return 'BOOLEAN';
  } else if (isFieldRating(fieldDefinition) && isFieldRatingValue(fieldValue)) {
    return 'RATING';
  } else if (isFieldNumber(fieldDefinition) && isFieldNumberValue(fieldValue)) {
    return 'NUMBER';
  } else if (
    isFieldCurrency(fieldDefinition) &&
    isFieldCurrencyValue(fieldValue)
  ) {
    return 'CURRENCY';
  } else if (
    isFieldFullName(fieldDefinition) &&
    isFieldFullNameValue(fieldValue)
  ) {
    return 'FULL_NAME';
  } else if (isFieldPhone(fieldDefinition) && isFieldPhoneValue(fieldValue)) {
    return 'PHONE';
  } else {
    return null;
  }
};
