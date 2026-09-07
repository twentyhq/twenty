import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { IconMinus, IconPlus } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';

const StyledCounterContainer = styled.div<{ $showButtons: boolean }>`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[1]};
  margin-left: auto;
  width: ${({ $showButtons }) =>
    $showButtons
      ? themeCssVariables.spacing[30]
      : themeCssVariables.spacing[16]};

  button svg {
    pointer-events: none;
  }
`;

const StyledTextInputContainer = styled.div`
  width: ${() => themeCssVariables.spacing[16]};

  input {
    font-weight: ${() => themeCssVariables.font.weight.medium};
    height: ${() => themeCssVariables.spacing[6]};
    text-align: center;
    width: ${() => themeCssVariables.spacing[16]};
  }
`;

type SettingsCounterProps = {
  value: string;
  onChange: (value: string, changeType: 'input' | 'button') => void;
  onBlur?: () => void;
  minValue?: number;
  maxValue?: number;
  disabled?: boolean;
  showButtons?: boolean;
  inputId?: string;
  errorMessageId?: string;
  isInvalid?: boolean;
};

// twenty-front's SettingsCounter works on numbers and snaps invalid text back
// to minValue. The app keeps its own draft-string validation instead, so a
// half-typed value stays on screen with the Invalid number line beneath it.
export const SettingsCounter = ({
  value,
  onChange,
  onBlur,
  minValue = 0,
  maxValue,
  disabled = false,
  showButtons = true,
  inputId,
  errorMessageId,
  isInvalid = false,
}: SettingsCounterProps) => {
  const parsedValue = Number(value.trim());
  const isParsable = value.trim() !== '' && Number.isFinite(parsedValue);

  const handleDecrementCounter = () => {
    if (!isParsable) {
      onChange(String(minValue), 'button');
      return;
    }

    const nextValue = Math.max(parsedValue - 1, minValue);

    if (nextValue !== parsedValue) {
      onChange(String(nextValue), 'button');
    }
  };

  const handleIncrementCounter = () => {
    if (!isParsable) {
      onChange(String(minValue), 'button');
      return;
    }

    const nextValue = isUndefined(maxValue)
      ? parsedValue + 1
      : Math.min(parsedValue + 1, maxValue);

    if (nextValue !== parsedValue) {
      onChange(String(nextValue), 'button');
    }
  };

  const handleTextInputChange = (nextValue: string) => {
    const nextParsedValue = Number(nextValue.trim());

    if (
      nextValue.trim() !== '' &&
      Number.isFinite(nextParsedValue) &&
      (nextParsedValue < minValue ||
        (!isUndefined(maxValue) && nextParsedValue > maxValue))
    ) {
      return;
    }

    onChange(nextValue, 'input');
  };

  return (
    <StyledCounterContainer $showButtons={showButtons}>
      {showButtons && (
        <IconButton
          size="small"
          Icon={IconMinus}
          variant="secondary"
          onClick={handleDecrementCounter}
          disabled={disabled}
          ariaLabel="Decrease"
        />
      )}
      <StyledTextInputContainer>
        <StyledSettingsTextInput
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          disabled={disabled}
          aria-describedby={errorMessageId}
          aria-invalid={isInvalid}
          onChange={(event) => handleTextInputChange(event.target.value)}
          onBlur={onBlur}
        />
      </StyledTextInputContainer>
      {showButtons && (
        <IconButton
          size="small"
          Icon={IconPlus}
          variant="secondary"
          onClick={handleIncrementCounter}
          disabled={disabled}
          ariaLabel="Increase"
        />
      )}
    </StyledCounterContainer>
  );
};
