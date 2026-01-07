import { useGetRelativeDateFilterWithUserTimezone } from '@/object-record/record-filter/hooks/useGetRelativeDateFilterWithUserTimezone';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';

import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { DEFAULT_RELATIVE_DATE_FILTER_VALUE } from 'twenty-shared/constants';

import {
  type RelativeDateFilter,
  resolveRelativeDateFilterStringified,
} from 'twenty-shared/utils';

export type FormRelativeDatePickerProps = {
  label?: string;
  defaultValue?: string;
  onChange: (value: RelativeDateFilter) => void;
  readonly?: boolean;
  isDateTimeField?: boolean;
};

export const FormRelativeDatePicker = ({
  defaultValue,
  onChange,
  readonly,
  isDateTimeField,
}: FormRelativeDatePickerProps) => {
  const instanceId = useId();

  const { getRelativeDateFilterWithUserTimezone } =
    useGetRelativeDateFilterWithUserTimezone();

  const valueParsed = isNonEmptyString(defaultValue)
    ? resolveRelativeDateFilterStringified(defaultValue)
    : DEFAULT_RELATIVE_DATE_FILTER_VALUE;

  const handleValueChange = (newValue: RelativeDateFilter) => {
    const newValueWithTimezone =
      getRelativeDateFilterWithUserTimezone(newValue);

    onChange(newValueWithTimezone);
  };

  return (
    <RelativeDatePickerHeader
      instanceId={instanceId}
      onChange={handleValueChange}
      direction={valueParsed?.direction ?? 'THIS'}
      unit={valueParsed?.unit ?? 'DAY'}
      amount={valueParsed?.amount ?? undefined}
      isFormField={true}
      readonly={readonly}
      unitDropdownWidth={150}
      allowIntraDayUnits={isDateTimeField}
    />
  );
};
