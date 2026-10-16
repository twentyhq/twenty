import { styled } from '@linaria/react';
import { useId } from 'react';
import { Field, type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { parseCssSizeValue } from '@/advanced-text-editor/utils/parseCssSizeValue';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const SIZE_UNIT_OPTIONS: SelectOption<string>[] = ['px', '%', 'em'].map(
  (sizeUnit) => ({ label: sizeUnit, value: sizeUnit }),
);

type EmailSizeInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const EmailSizeInput = ({
  label,
  value,
  onChange,
  placeholder,
}: EmailSizeInputProps) => {
  const instanceId = useId();
  const { amount, unit } = parseCssSizeValue(value);
  const displayedAmount = amount === '' ? value.trim() : amount;

  const commit = (nextAmount: string, nextUnit: string) => {
    const trimmedAmount = nextAmount.trim();

    if (trimmedAmount === '') {
      onChange('');
      return;
    }

    if (!/^-?(\d+|\d*\.\d+)$/.test(trimmedAmount)) {
      onChange(trimmedAmount);
      return;
    }

    onChange(`${trimmedAmount}${nextUnit}`);
  };

  return (
    <FormFieldInputContainer>
      <Field.Label>{label}</Field.Label>
      <StyledRow>
        <TextInput
          value={displayedAmount}
          onChange={(nextAmount) => commit(nextAmount, unit)}
          placeholder={placeholder ?? '0'}
          fullWidth
        />
        <Select
          dropdownId={`email-size-unit-${instanceId}`}
          value={unit}
          options={SIZE_UNIT_OPTIONS}
          onChange={(nextUnit) => commit(displayedAmount, nextUnit)}
          dropdownWidthAuto
        />
      </StyledRow>
    </FormFieldInputContainer>
  );
};
