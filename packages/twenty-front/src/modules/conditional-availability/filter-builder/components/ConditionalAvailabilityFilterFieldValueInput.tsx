import { ConditionalAvailabilityFilterValueInput } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterValueInput';
import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { useUpdateConditionalAvailabilityFilterSettings } from '@/conditional-availability/filter-builder/hooks/useUpdateConditionalAvailabilityFilterSettings';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { type ConditionalAvailabilityFilterFieldType } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterFieldType';
import { updateConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/updateConditionalAvailabilityFilter';
import { FormBooleanFieldInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldInput';
import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useLingui } from '@lingui/react/macro';
import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { type ExpressionLiteralNode } from 'twenty-shared/expression';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertUnreachable,
  convertCurrencyAmountToCurrencyMicros,
  convertCurrencyMicrosToCurrencyAmount,
  isDefined,
} from 'twenty-shared/utils';

type ConditionalAvailabilityFilterFieldValueInputProps = {
  filterFields: ConditionalAvailabilityFilterField[];
  filter: ConditionalAvailabilityFilter;
  type: ConditionalAvailabilityFilterFieldType;
};

export const ConditionalAvailabilityFilterFieldValueInput = ({
  filterFields,
  filter,
  type,
}: ConditionalAvailabilityFilterFieldValueInputProps) => {
  const { t } = useLingui();
  const { readonly } = useConditionalAvailabilityFilterBuilderContextOrThrow();
  const { updateConditionalAvailabilityFilterSettings } =
    useUpdateConditionalAvailabilityFilterSettings();

  const [value] = filter.values;

  const handleValueChange = (
    nextValue: ExpressionLiteralNode['value'] | null,
  ) => {
    const values = isDefined(nextValue) && nextValue !== '' ? [nextValue] : [];

    updateConditionalAvailabilityFilterSettings(
      (currentConditionalAvailabilityFilterGroup) =>
        updateConditionalAvailabilityFilter({
          filterGroup: currentConditionalAvailabilityFilterGroup,
          filterId: filter.id,
          update: (filterToUpdate) => ({ ...filterToUpdate, values }),
        }),
    );
  };

  switch (type) {
    case FieldMetadataType.SELECT:
    case FieldMetadataType.RELATION:
      return (
        <ConditionalAvailabilityFilterValueInput
          filterFields={filterFields}
          filter={filter}
        />
      );
    case FieldMetadataType.TEXT:
      return (
        <FormTextFieldInput
          defaultValue={isString(value) ? value : undefined}
          onChange={handleValueChange}
          readonly={readonly}
          placeholder={t`Enter value`}
        />
      );
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      return (
        <FormNumberFieldInput
          defaultValue={isNumber(value) ? value : undefined}
          onChange={(number) =>
            handleValueChange(isNumber(number) ? number : null)
          }
          readonly={readonly}
        />
      );
    case FieldMetadataType.CURRENCY:
      return (
        <FormNumberFieldInput
          defaultValue={
            isNumber(value)
              ? convertCurrencyMicrosToCurrencyAmount(value)
              : undefined
          }
          onChange={(amount) =>
            handleValueChange(
              isNumber(amount)
                ? convertCurrencyAmountToCurrencyMicros(amount)
                : null,
            )
          }
          readonly={readonly}
        />
      );
    case FieldMetadataType.BOOLEAN:
      return (
        <FormBooleanFieldInput
          defaultValue={isBoolean(value) ? value : undefined}
          onChange={(boolean) =>
            handleValueChange(isBoolean(boolean) ? boolean : null)
          }
          readonly={readonly}
        />
      );
    case FieldMetadataType.DATE:
      return (
        <FormDateFieldInput
          defaultValue={isString(value) ? value : undefined}
          onChange={handleValueChange}
          readonly={readonly}
        />
      );
    case FieldMetadataType.DATE_TIME:
      return (
        <FormDateTimeFieldInput
          defaultValue={isString(value) ? value : undefined}
          onChange={handleValueChange}
          readonly={readonly}
        />
      );
    default:
      return assertUnreachable(type);
  }
};
