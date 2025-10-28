import { isArray, isNonEmptyArray, isString } from '@sniptt/guards';

import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldActor } from '@/object-record/record-field/ui/types/guards/isFieldActor';
import { isFieldActorValue } from '@/object-record/record-field/ui/types/guards/isFieldActorValue';
import { isFieldAddress } from '@/object-record/record-field/ui/types/guards/isFieldAddress';
import { isFieldAddressValue } from '@/object-record/record-field/ui/types/guards/isFieldAddressValue';
import { isFieldArray } from '@/object-record/record-field/ui/types/guards/isFieldArray';
import { isFieldArrayValue } from '@/object-record/record-field/ui/types/guards/isFieldArrayValue';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';
import { isFieldDate } from '@/object-record/record-field/ui/types/guards/isFieldDate';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldEmailsValue } from '@/object-record/record-field/ui/types/guards/isFieldEmailsValue';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldLinksValue } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { isFieldMultiSelectValue } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelectValue';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldPhonesValue } from '@/object-record/record-field/ui/types/guards/isFieldPhonesValue';
import { isFieldPosition } from '@/object-record/record-field/ui/types/guards/isFieldPosition';
import { isFieldRating } from '@/object-record/record-field/ui/types/guards/isFieldRating';
import { isFieldRawJson } from '@/object-record/record-field/ui/types/guards/isFieldRawJson';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isFieldRichText } from '@/object-record/record-field/ui/types/guards/isFieldRichText';
import { isFieldRichTextV2 } from '@/object-record/record-field/ui/types/guards/isFieldRichTextV2';
import { isFieldRichTextV2Value } from '@/object-record/record-field/ui/types/guards/isFieldRichTextValueV2';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';
import { isFieldSelectValue } from '@/object-record/record-field/ui/types/guards/isFieldSelectValue';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isFieldTsVector } from '@/object-record/record-field/ui/types/guards/isFieldTsVectorValue';
import { isFieldUuid } from '@/object-record/record-field/ui/types/guards/isFieldUuid';
import { isDefined } from 'twenty-shared/utils';

const isValueEmpty = (value: unknown) =>
  !isDefined(value) || (isString(value) && value === '');

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

  if (isFieldMorphRelation(fieldDefinition)) {
    if (!isArray(fieldValue)) {
      return isValueEmpty(fieldValue);
    }

    const areValuesEmpty = fieldValue
      .filter(isDefined)
      .every((fieldValueWithObjectNameSingular) => {
        if ('value' in fieldValueWithObjectNameSingular) {
          const value = fieldValueWithObjectNameSingular?.value;
          if (!isArray(value)) {
            return isValueEmpty(value);
          }
          return !isNonEmptyArray(value);
        }
        return true;
      });
    return areValuesEmpty;
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
    if (!isFieldLinksValue(fieldValue)) {
      return true;
    }

    const definedLinks = getFieldLinkDefinedLinks(fieldValue);
    const isFieldLinksEmpty = definedLinks.length === 0;

    return isFieldLinksEmpty;
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

  if (isFieldRichTextV2(fieldDefinition)) {
    return (
      !isFieldRichTextV2Value(fieldValue) || isValueEmpty(fieldValue?.markdown)
    );
  }

  throw new Error(
    `Entity field type not supported in isFieldValueEmpty : ${fieldDefinition.type}}`,
  );
};
