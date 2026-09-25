import { t } from '@lingui/core/macro';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { IconMinus, IconPlus } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';
import { castAsNumberOrNull } from '~/utils/cast-as-number-or-null';

type SettingsCounterProps = {
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  disabled?: boolean;
  showButtons?: boolean;
};

const StyledCounterContainer = styled.div<{ showButtons: boolean }>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin-left: auto;
  width: ${({ showButtons }) =>
    showButtons
      ? themeCssVariables.spacing[30]
      : themeCssVariables.spacing[16]};
`;

const StyledTextInputContainer = styled.div`
  width: ${themeCssVariables.spacing[16]};

  > * input {
    font-weight: ${themeCssVariables.font.weight.medium};
    height: ${themeCssVariables.spacing[6]};
    text-align: center;
    width: ${themeCssVariables.spacing[16]};
  }
`;

export const SettingsCounter = ({
  value,
  onChange,
  minValue = 0,
  maxValue,
  disabled = false,
  showButtons = true,
}: SettingsCounterProps) => {
  const handleIncrementCounter = () => {
    if (maxValue === undefined || value < maxValue) {
      onChange(value + 1);
    }
  };

  const handleDecrementCounter = () => {
    if (value > minValue) {
      onChange(value - 1);
    }
  };

  const handleTextInputChange = (value: string) => {
    const castedNumber = castAsNumberOrNull(value);
    if (castedNumber === null) {
      onChange(minValue);
      return;
    }

    if (castedNumber < minValue) {
      return;
    }

    if (maxValue !== undefined && castedNumber > maxValue) {
      onChange(maxValue);
      return;
    }
    onChange(castedNumber);
  };

  return (
    <StyledCounterContainer showButtons={showButtons}>
      {showButtons && (
        <IconButton
          aria-label={t`Decrease value`}
          size="sm"
          variant="outline"
          onClick={handleDecrementCounter}
          disabled={disabled}
        >
          <IconMinus />
        </IconButton>
      )}
      <StyledTextInputContainer>
        <SettingsTextInput
          instanceId="settings-counter-input"
          name="counter"
          fullWidth
          value={value.toString()}
          onChange={handleTextInputChange}
          disabled={disabled}
        />
      </StyledTextInputContainer>
      {showButtons && (
        <IconButton
          aria-label={t`Increase value`}
          size="sm"
          variant="outline"
          onClick={handleIncrementCounter}
          disabled={disabled}
        >
          <IconPlus />
        </IconButton>
      )}
    </StyledCounterContainer>
  );
};
