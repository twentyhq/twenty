import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { isFieldDateTime } from '@/object-record/record-field/types/guards/isFieldDateTime';
import { isFieldEmail } from '@/object-record/record-field/types/guards/isFieldEmail';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldLink } from '@/object-record/record-field/types/guards/isFieldLink';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldRelationValue } from '@/object-record/record-field/types/guards/isFieldRelationValue';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { isFieldUuid } from '@/object-record/record-field/types/guards/isFieldUuid';

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
    isFieldEmail(fieldDefinition) ||
    isFieldRelationValue(fieldDefinition)
  ) {
    return '' as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldLink(fieldDefinition)) {
    return { url: '', label: '' } as FieldInputDraftValue<FieldValue>;
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

  throw new Error(`Record field type not supported : ${fieldDefinition.type}}`);
};
