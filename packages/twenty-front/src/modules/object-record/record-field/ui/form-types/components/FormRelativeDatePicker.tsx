import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import {
  type VariableDateViewFilterValueDirection,
  type VariableDateViewFilterValueUnit,
} from '@/views/view-filter-value/utils/resolveDateViewFilterValue';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { DEFAULT_RELATIVE_DATE_VALUE } from 'twenty-shared/types';
import { safeParseRelativeDateValue } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';

type RelativeDatePickerValue = {
  direction: VariableDateViewFilterValueDirection;
  amount?: number;
  unit: VariableDateViewFilterValueUnit;
};

export type FormRelativeDatePickerProps = {
  label?: string;
  defaultValue?: string;
  onChange: (value: JsonValue) => void;
  readonly?: boolean;
};

export const FormRelativeDatePicker = ({
  defaultValue,
  onChange,
  readonly,
}: FormRelativeDatePickerProps) => {
  const value =
    isString(defaultValue) && isNonEmptyString(defaultValue)
      ? safeParseRelativeDateValue(defaultValue)
      : DEFAULT_RELATIVE_DATE_VALUE;

  const handleValueChange = (newValue: RelativeDatePickerValue) => {
    onChange(JSON.stringify(newValue));
  };

  return (
    <RelativeDatePickerHeader
      onChange={handleValueChange}
      direction={value?.direction ?? 'THIS'}
      unit={value?.unit ?? 'DAY'}
      amount={value?.amount}
      isFormField={true}
      readonly={readonly}
    />
  );
};
