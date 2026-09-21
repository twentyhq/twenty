import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { parseCssSizeValue } from '@/advanced-text-editor/utils/parseCssSizeValue';
import { StyledEmailFieldLabel } from '@/side-panel/pages/email-block-settings/components/StyledEmailFieldLabel';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};

  & > :first-child {
    flex: 1;
  }
`;

const StyledUnitSelect = styled.select`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const SIZE_UNITS = ['px', '%', 'em'] as const;

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
    <div>
      <StyledEmailFieldLabel>{label}</StyledEmailFieldLabel>
      <StyledRow>
        <TextInput
          value={displayedAmount}
          onChange={(nextAmount) => commit(nextAmount, unit)}
          placeholder={placeholder ?? '0'}
          fullWidth
        />
        <StyledUnitSelect
          value={unit}
          onChange={(event) => commit(displayedAmount, event.target.value)}
        >
          {SIZE_UNITS.map((sizeUnit) => (
            <option key={sizeUnit} value={sizeUnit}>
              {sizeUnit}
            </option>
          ))}
        </StyledUnitSelect>
      </StyledRow>
    </div>
  );
};
