import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledColorTrigger = styled.div`
  display: flex;
  flex-shrink: 0;
  position: relative;
`;

const StyledNativeColorInput = styled.input`
  border: 0;
  height: 100%;
  left: 0;
  opacity: 0;
  padding: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
`;

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

// oxlint-disable-next-line twenty/no-hardcoded-colors
const COLOR_SWATCH_FALLBACK = '#ffffff';

type EmailColorInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const EmailColorInput = ({
  label,
  value,
  onChange,
  placeholder,
}: EmailColorInputProps) => {
  const { t } = useLingui();
  const nativeColorInputRef = useRef<HTMLInputElement>(null);

  const swatchColor = HEX_COLOR_PATTERN.test(value)
    ? value
    : COLOR_SWATCH_FALLBACK;

  return (
    <FormFieldInputContainer>
      <Field.Label>{label}</Field.Label>
      <StyledRow>
        <StyledColorTrigger>
          <LightIconButton
            size="md"
            aria-label={t`Pick a color`}
            onClick={() => nativeColorInputRef.current?.click()}
          >
            <ColorSample
              colorName="gray"
              color={swatchColor}
              variant="circle"
            />
          </LightIconButton>
          <StyledNativeColorInput
            ref={nativeColorInputRef}
            type="color"
            tabIndex={-1}
            aria-hidden="true"
            value={swatchColor}
            onChange={(event) => onChange(event.target.value)}
          />
        </StyledColorTrigger>
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? COLOR_SWATCH_FALLBACK}
          fullWidth
        />
      </StyledRow>
    </FormFieldInputContainer>
  );
};
