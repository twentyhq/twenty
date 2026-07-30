import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TextInput } from '@/ui/input/components/TextInput';
import { type MessageDescriptor } from '@lingui/core';

const StyledFieldRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};

  & > :first-child {
    flex: 1;
  }
`;

const StyledColorSwatchInput = styled.input`
  background: none;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: pointer;
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

type CampaignBlockSettingsFieldInputProps = {
  field: {
    label: MessageDescriptor;
    input: 'text' | 'color';
    placeholder?: string;
  };
  value: string;
  onChange: (value: string) => void;
};

export const CampaignBlockSettingsFieldInput = ({
  field,
  value,
  onChange,
}: CampaignBlockSettingsFieldInputProps) => {
  const { i18n } = useLingui();

  return (
    <StyledFieldRow>
      <TextInput
        label={i18n._(field.label)}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder ?? ''}
        fullWidth
      />
      {field.input === 'color' && (
        <StyledColorSwatchInput
          type="color"
          value={HEX_COLOR_PATTERN.test(value) ? value : COLOR_SWATCH_FALLBACK}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </StyledFieldRow>
  );
};
