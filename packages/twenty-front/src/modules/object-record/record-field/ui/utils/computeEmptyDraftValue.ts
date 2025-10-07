import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldInputDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldAddress } from '@/object-record/record-field/ui/types/guards/isFieldAddress';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldRawJson } from '@/object-record/record-field/ui/types/guards/isFieldRawJson';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isFieldUuid } from '@/object-record/record-field/ui/types/guards/isFieldUuid';
import { CurrencyCode } from 'twenty-shared/constants';
import { CustomError } from 'twenty-shared/utils';

type computeEmptyDraftValueParams = {
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type'>;
};

export const computeEmptyDraftValue = <FieldValue>({
  fieldDefinition,
}: computeEmptyDraftValueParams): FieldInputDraftValue<FieldValue> => {
  // Todo: improve typing
  if (
    isFieldUuid(fieldDefinition) ||
    isFieldText(fieldDefinition) ||
    isFieldDateTime(fieldDefinition) ||
    isFieldNumber(fieldDefinition) ||
    isFieldRelation(fieldDefinition) ||
    isFieldRawJson(fieldDefinition)
  ) {
    return '' as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldLinks(fieldDefinition)) {
    return {
      primaryLinkUrl: '',
      primaryLinkLabel: '',
    } as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldAddress(fieldDefinition)) {
    return {
      addressStreet1: '',
      addressStreet2: '',
      addressCity: '',
      addressState: '',
      addressCountry: '',
      addressPostcode: '',
    } as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldCurrency(fieldDefinition)) {
    return {
      amount: '',
      currenyCode: CurrencyCode.USD,
    } as unknown as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldFullName(fieldDefinition)) {
    return {
      firstName: '',
      lastName: '',
    } as FieldInputDraftValue<FieldValue>;
  }

  throw new CustomError(
    `Record field type not supported : ${fieldDefinition.type}}`,
    'RECORD_FIELD_TYPE_NOT_SUPPORTED',
  );
};
