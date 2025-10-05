import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import styled from '@emotion/styled';
import { IconMinus, IconPlus } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
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
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: auto;
  width: ${({ theme, showButtons }) =>
    showButtons ? theme.spacing(30) : theme.spacing(16)};
`;

const StyledTextInput = styled(SettingsTextInput)`
  width: ${({ theme }) => theme.spacing(16)};
  input {
    width: ${({ theme }) => theme.spacing(16)};
    height: ${({ theme }) => theme.spacing(6)};
    text-align: center;
    font-weight: ${({ theme }) => theme.font.weight.medium};
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
      <StyledTextInput
        instanceId="settings-counter-input"
        name="counter"
        fullWidth
        value={value.toString()}
        onChange={handleTextInputChange}
        disabled={disabled}
      />
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
