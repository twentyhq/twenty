import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldInputDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldAddress } from '@/object-record/record-field/ui/types/guards/isFieldAddress';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isFieldUuid } from '@/object-record/record-field/ui/types/guards/isFieldUuid';
import { CurrencyCode } from 'twenty-shared/constants';
import { CustomError } from 'twenty-shared/utils';

type computeDraftValueFromStringParams = {
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type'>;
  value: string;
};

export const computeDraftValueFromString = <FieldValue>({
  fieldDefinition,
  value,
}: computeDraftValueFromStringParams):
  | FieldInputDraftValue<FieldValue>
  | undefined => {
  // Todo: improve typing
  if (
    isFieldUuid(fieldDefinition) ||
    isFieldText(fieldDefinition) ||
    isFieldDateTime(fieldDefinition) ||
    isFieldNumber(fieldDefinition) ||
    isFieldRelation(fieldDefinition)
  ) {
    return value as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldCurrency(fieldDefinition)) {
    return {
      amount: value,
      currenyCode: CurrencyCode.USD,
    } as unknown as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldFullName(fieldDefinition)) {
    return {
      firstName: value,
      lastName: '',
    } as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldAddress(fieldDefinition)) {
    return {
      addressStreet1: value,
    } as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldLinks(fieldDefinition)) {
    return {
      primaryLinkUrl: value,
    } as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldEmails(fieldDefinition)) {
    return {
      primaryEmail: value,
    } as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldPhones(fieldDefinition)) {
    return {
      primaryPhoneNumber: value,
    } as FieldInputDraftValue<FieldValue>;
  }

  throw new CustomError(
    `Record field type not supported : ${fieldDefinition.type}}`,
    'RECORD_FIELD_TYPE_NOT_SUPPORTED',
  );
};
