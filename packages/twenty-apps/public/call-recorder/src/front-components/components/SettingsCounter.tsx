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
  onChange: (value: string) => void;
  minValue?: number;
  maxValue?: number;
  disabled?: boolean;
  showButtons?: boolean;
  inputId?: string;
};

// twenty-front's SettingsCounter works on numbers and snaps invalid text back
// to minValue. The app keeps its own draft-string validation instead, so a
// half-typed value stays on screen with the Invalid number line beneath it.
export const SettingsCounter = ({
  value,
  onChange,
  minValue = 0,
  maxValue,
  disabled = false,
  showButtons = true,
  inputId,
}: SettingsCounterProps) => {
  const parsedValue = Number(value.trim());
  const isParsable = value.trim() !== '' && Number.isFinite(parsedValue);

  const handleDecrementCounter = () => {
    if (!isParsable) {
      onChange(String(minValue));
      return;
    }

    if (parsedValue > minValue) {
      onChange(String(parsedValue - 1));
    }
  };

  const handleIncrementCounter = () => {
    if (!isParsable) {
      onChange(String(minValue));
      return;
    }

    if (isUndefined(maxValue) || parsedValue < maxValue) {
      onChange(String(parsedValue + 1));
    }
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
          onChange={(event) => onChange(event.target.value)}
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
