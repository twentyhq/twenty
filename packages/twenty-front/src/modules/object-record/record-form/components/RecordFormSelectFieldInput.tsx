import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCircleOff } from 'twenty-ui/icon';
import { Field, type SelectOption } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

type RecordFormSelectFieldInputProps = {
  label?: string;
  defaultValue?: string | null;
  onChange: (value: string | null) => void;
  options: SelectOption[];
  readonly?: boolean;
  isNullable?: boolean;
  placeholder?: string;
};

export const RecordFormSelectFieldInput = ({
  label,
  defaultValue,
  onChange,
  options,
  readonly,
  isNullable,
  placeholder,
}: RecordFormSelectFieldInputProps) => {
  const theme = useTheme();
  const instanceId = useId();

  const emptyOption: SelectOption = {
    label: label ? t`No ${label}` : t`No value`,
    value: '',
    Icon: IconCircleOff,
  };

  const optionsWithEmptyOption =
    isNullable || options.length === 0 ? [emptyOption, ...options] : options;

  const selectedValue = defaultValue ?? '';

  const selectedOption =
    isDefined(placeholder) && selectedValue === ''
      ? undefined
      : optionsWithEmptyOption.find((option) => option.value === selectedValue);

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}

      <FormFieldInputRowContainer>
        <Select
          dropdownId={`${instanceId}-select`}
          options={optionsWithEmptyOption}
          value={selectedOption?.value}
          emptyOption={
            isDefined(placeholder)
              ? { label: placeholder, value: '' }
              : undefined
          }
          onChange={(value) => onChange(isNonEmptyString(value) ? value : null)}
          fullWidth
          renderAsTag
          withSearchInput
          disabled={readonly}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
          dropdownSideOffset={parseInt(theme.spacing[1], 10)}
        />
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
