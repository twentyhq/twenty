import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/types/guards/isFieldCurrencyValue';
import { isFieldRawJson } from '@/object-record/record-field/types/guards/isFieldRawJson';
import { isFieldRawJsonValue } from '@/object-record/record-field/types/guards/isFieldRawJsonValue';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { computeEmptyDraftValue } from '@/object-record/record-field/utils/computeEmptyDraftValue';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

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
      amount: isUndefinedOrNull(fieldValue?.amountMicros)
        ? ''
        : (fieldValue.amountMicros / 1000000).toString(),
      currencyCode: fieldValue?.currencyCode ?? '',
    } as unknown as FieldInputDraftValue<FieldValue>;
  }

  if (isFieldRelation(fieldDefinition)) {
    return computeEmptyDraftValue<FieldValue>({ fieldDefinition });
  }

  if (isFieldRawJson(fieldDefinition)) {
    return isFieldRawJsonValue(fieldValue) && isDefined(fieldValue)
      ? (JSON.stringify(
          fieldValue,
          null,
          2,
        ) as FieldInputDraftValue<FieldValue>)
      : computeEmptyDraftValue<FieldValue>({ fieldDefinition });
  }

  return fieldValue as FieldInputDraftValue<FieldValue>;
};
