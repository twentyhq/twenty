import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { Button, IconMinus, IconPlus } from 'twenty-ui';
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

const StyledTextInput = styled(TextInput)`
  width: ${({ theme }) => theme.spacing(16)};
  input {
    width: ${({ theme }) => theme.spacing(16)};
    height: ${({ theme }) => theme.spacing(6)};
    text-align: center;
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
`;

const StyledControlButton = styled(Button)`
  height: ${({ theme }) => theme.spacing(6)};
  width: ${({ theme }) => theme.spacing(6)};
  padding: 0;
  justify-content: center;
  svg {
    height: ${({ theme }) => theme.spacing(4)};
    width: ${({ theme }) => theme.spacing(4)};
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
      <StyledControlButton
        variant="secondary"
        onClick={handleDecrementCounter}
        Icon={IconMinus}
        disabled={disabled}
      />
      <StyledTextInput
        name="counter"
        fullWidth
        value={value.toString()}
        onChange={handleTextInputChange}
        disabled={disabled}
      />
      <StyledControlButton
        variant="secondary"
        onClick={handleIncrementCounter}
        Icon={IconPlus}
        disabled={disabled}
      />
    </StyledCounterContainer>
  );
};
