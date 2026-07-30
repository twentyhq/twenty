import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledCampaignFieldLabel } from '@/side-panel/pages/campaign-block-settings/components/StyledCampaignFieldLabel';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};

  & > :last-child {
    flex: 1;
  }
`;

const StyledColorSwatchInput = styled.input`
  background: none;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: pointer;
  flex-shrink: 0;
  height: 32px;
  padding: 2px;
  width: 32px;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: ${themeCssVariables.border.radius.xs};
  }
`;

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

// The native color input needs a concrete hex fallback; email content colors
// are literal values, not theme variables.
// oxlint-disable-next-line twenty/no-hardcoded-colors
const COLOR_SWATCH_FALLBACK = '#ffffff';

type CampaignColorInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const CampaignColorInput = ({
  label,
  value,
  onChange,
  placeholder,
}: CampaignColorInputProps) => {
  return (
    <div>
      <StyledCampaignFieldLabel>{label}</StyledCampaignFieldLabel>
      <StyledRow>
        <StyledColorSwatchInput
          type="color"
          value={HEX_COLOR_PATTERN.test(value) ? value : COLOR_SWATCH_FALLBACK}
          onChange={(event) => onChange(event.target.value)}
        />
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? COLOR_SWATCH_FALLBACK}
          fullWidth
        />
      </StyledRow>
    </div>
  );
};
