import styled from '@emotion/styled';

import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { IconInfoCircle, IconMinus, IconPlus } from 'twenty-ui';
import { castAsNumberOrNull } from '~/utils/cast-as-number-or-null';

type SettingsDataModelFieldNumberDecimalsInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const StyledCounterContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
`;

const StyledExampleText = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledCounterControlsIcons = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledCounterInnerContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  height: 24px;
`;

const StyledTextInput = styled(TextInput)`
  width: ${({ theme }) => theme.spacing(16)};
  input {
    width: ${({ theme }) => theme.spacing(16)};
    height: ${({ theme }) => theme.spacing(6)};
    text-align: center;
    font-weight: ${({ theme }) => theme.font.weight.medium};
    background: ${({ theme }) => theme.background.noisy};
  }
  input ~ div {
    padding-right: ${({ theme }) => theme.spacing(0)};
    border-radius: ${({ theme }) => theme.spacing(1)};
    background: ${({ theme }) => theme.background.noisy};
  }
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
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

const StyledInfoButton = styled(Button)`
  height: ${({ theme }) => theme.spacing(6)};
  width: ${({ theme }) => theme.spacing(6)};
  padding: 0;
  justify-content: center;
  svg {
    color: ${({ theme }) => theme.font.color.extraLight};
    height: ${({ theme }) => theme.spacing(4)};
    width: ${({ theme }) => theme.spacing(4)};
  }
`;

const MIN_VALUE = 0;
const MAX_VALUE = 100;
export const SettingsDataModelFieldNumberDecimalsInput = ({
  value,
  onChange,
  disabled,
}: SettingsDataModelFieldNumberDecimalsInputProps) => {
  const exampleValue = (1000).toFixed(value);

  const handleIncrementCounter = () => {
    if (value < MAX_VALUE) {
      const newValue = value + 1;
      onChange(newValue);
    }
  };

  const handleDecrementCounter = () => {
    if (value > MIN_VALUE) {
      const newValue = value - 1;
      onChange(newValue);
    }
  };

  const handleTextInputChange = (value: string) => {
    const castedNumber = castAsNumberOrNull(value);
    if (castedNumber === null) {
      onChange(MIN_VALUE);
      return;
    }

    if (castedNumber < MIN_VALUE) {
      return;
    }

    if (castedNumber > MAX_VALUE) {
      onChange(MAX_VALUE);
      return;
    }
    onChange(castedNumber);
  };
  return (
    <>
      <StyledTitle>Number of decimals</StyledTitle>
      <StyledCounterContainer>
        <StyledCounterInnerContainer>
          <StyledExampleText>Example: {exampleValue}</StyledExampleText>
          <StyledCounterControlsIcons>
            <StyledInfoButton variant="tertiary" Icon={IconInfoCircle} />
            <StyledControlButton
              variant="secondary"
              onClick={handleDecrementCounter}
              Icon={IconMinus}
              disabled={disabled}
            />
            <StyledTextInput
              name="decimals"
              fullWidth
              value={value.toString()}
              onChange={(value) => handleTextInputChange(value)}
              disabled={disabled}
            />
            <StyledControlButton
              variant="secondary"
              onClick={handleIncrementCounter}
              Icon={IconPlus}
              disabled={disabled}
            />
          </StyledCounterControlsIcons>
        </StyledCounterInnerContainer>
      </StyledCounterContainer>
    </>
  );
};
