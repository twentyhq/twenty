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
};

const StyledCounterContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: auto;
  width: ${({ theme }) => theme.spacing(30)};
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
  maxValue = 100,
  disabled = false,
}: SettingsCounterProps) => {
  const handleIncrementCounter = () => {
    if (value < maxValue) {
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

    if (castedNumber > maxValue) {
      onChange(maxValue);
      return;
    }
    onChange(castedNumber);
  };

  return (
    <StyledCounterContainer>
      <IconButton
        size="small"
        Icon={IconMinus}
        variant="secondary"
        onClick={handleDecrementCounter}
        disabled={disabled}
      />
      <StyledTextInput
        instanceId="settings-counter-input"
        name="counter"
        fullWidth
        value={value.toString()}
        onChange={handleTextInputChange}
        disabled={disabled}
      />
      <IconButton
        size="small"
        Icon={IconPlus}
        variant="secondary"
        onClick={handleIncrementCounter}
        disabled={disabled}
      />
    </StyledCounterContainer>
  );
};
