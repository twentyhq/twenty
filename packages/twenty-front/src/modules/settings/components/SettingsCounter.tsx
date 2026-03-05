import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { IconMinus, IconPlus } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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
    width: ${themeCssVariables.spacing[16]};
    height: ${themeCssVariables.spacing[6]};
    text-align: center;
    font-weight: ${themeCssVariables.font.weight.medium};
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
          size="small"
          Icon={IconMinus}
          variant="secondary"
          onClick={handleDecrementCounter}
          disabled={disabled}
        />
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
          size="small"
          Icon={IconPlus}
          variant="secondary"
          onClick={handleIncrementCounter}
          disabled={disabled}
        />
      )}
    </StyledCounterContainer>
  );
};
