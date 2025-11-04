import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';

import { isNonEmptyString, isString } from '@sniptt/guards';
import { DEFAULT_RELATIVE_DATE_FILTER_VALUE } from 'twenty-shared/constants';

import {
  type RelativeDateFilter,
  safeParseRelativeDateFilterJSONStringified,
} from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';

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
      ? safeParseRelativeDateFilterJSONStringified(defaultValue)
      : DEFAULT_RELATIVE_DATE_FILTER_VALUE;

  const handleValueChange = (newValue: RelativeDateFilter) => {
    onChange(JSON.stringify(newValue));
  };

  return (
    <RelativeDatePickerHeader
      onChange={handleValueChange}
      direction={value?.direction ?? 'THIS'}
      unit={value?.unit ?? 'DAY'}
      amount={value?.amount ?? undefined}
      isFormField={true}
      readonly={readonly}
      unitDropdownWidth={150}
    />
  );
};
