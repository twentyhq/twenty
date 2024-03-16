import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/types/guards/isFieldCurrencyValue';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { computeEmptyDraftValue } from '@/object-record/record-field/utils/computeEmptyDraftValue';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';

type computeDraftValueFromFieldValueParams<FieldValue> = {
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type'>;
  fieldValue: FieldValue;
};

export const computeDraftValueFromFieldValue = <FieldValue>({
  fieldValue,
  fieldDefinition,
}: computeDraftValueFromFieldValueParams<FieldValue>): FieldInputDraftValue<FieldValue> => {
  // Todo: implement type guards at runtime here
  // The idea is that fieldValue type is more restricted
  // than the intputDraftValue type as string can be typed anywhere

  if (isFieldCurrency(fieldDefinition)) {
    if (
      isFieldValueEmpty({ fieldValue, fieldDefinition }) ||
      !isFieldCurrencyValue(fieldValue)
    ) {
      return computeEmptyDraftValue<FieldValue>({ fieldDefinition });
    }

    return {
      amount: fieldValue?.amountMicros ? fieldValue.amountMicros / 1000000 : '',
      currencyCode: fieldValue?.currencyCode ?? '',
    } as unknown as FieldInputDraftValue<FieldValue>;
  }
  if (isFieldRelation(fieldDefinition)) {
    return computeEmptyDraftValue<FieldValue>({ fieldDefinition });
  }

  return fieldValue as FieldInputDraftValue<FieldValue>;
};
