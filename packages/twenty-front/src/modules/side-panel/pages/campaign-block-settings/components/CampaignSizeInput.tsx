import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { parseCssSizeValue } from '@/advanced-text-editor/utils/parseCssSizeValue';
import { StyledCampaignFieldLabel } from '@/side-panel/pages/campaign-block-settings/components/StyledCampaignFieldLabel';
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

type CampaignSizeInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

// A "600px"-style value split into a number input and a unit dropdown.
export const CampaignSizeInput = ({
  label,
  value,
  onChange,
  placeholder,
}: CampaignSizeInputProps) => {
  const { amount, unit } = parseCssSizeValue(value);
  const displayedAmount = amount === '' ? value.trim() : amount;

  const commit = (nextAmount: string, nextUnit: string) => {
    const trimmedAmount = nextAmount.trim();

    if (trimmedAmount === '') {
      onChange('');
      return;
    }

    if (Number.isNaN(Number(trimmedAmount))) {
      // Keep non-numeric values ("auto") untouched instead of suffixing them.
      onChange(trimmedAmount);
      return;
    }

    onChange(`${trimmedAmount}${nextUnit}`);
  };

  return (
    <div>
      <StyledCampaignFieldLabel>{label}</StyledCampaignFieldLabel>
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
