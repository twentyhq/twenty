import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isInteger, isNonEmptyString } from '@sniptt/guards';
import { useId, useRef } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { NumberStepper, type NumberStepperProps } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

const SETTINGS_COUNTER_CARET_NAVIGATION_KEYS: string[] = [Key.Home, Key.End];

const SETTINGS_COUNTER_SEPARATOR_AND_PLUS_SIGN_KEYS = ['.', ',', '+'];

type SettingsCounterProps = {
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  disabled?: boolean;
  showButtons?: boolean;
  'aria-labelledby': string;
  'aria-describedby'?: string;
};

const StyledCounterContainer = styled.div<{ showButtons: boolean }>`
  align-items: center;
  display: flex;
  margin-left: auto;
  width: ${({ showButtons }) =>
    showButtons
      ? themeCssVariables.spacing[30]
      : themeCssVariables.spacing[16]};
`;

export const SettingsCounter = ({
  value,
  onChange,
  minValue = 0,
  maxValue,
  disabled = false,
  showButtons = true,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: SettingsCounterProps) => {
  const instanceId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleFocus = () => {
    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.TEXT_INPUT,
        instanceId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleBlur: NonNullable<NumberStepperProps['onBlur']> = (event) => {
    removeFocusItemFromFocusStackById({ focusId: instanceId });

    const isFieldLeftEmpty = !isNonEmptyString(
      event.currentTarget.value.trim(),
    );

    if (isFieldLeftEmpty && value !== minValue) {
      onChange(minValue);
    }
  };

  const handleKeyDown: NonNullable<NumberStepperProps['onKeyDown']> = (
    event,
  ) => {
    if (SETTINGS_COUNTER_CARET_NAVIGATION_KEYS.includes(event.key)) {
      event.preventBaseUIHandler();
      return;
    }

    const isBlockedMinusSign = event.key === '-' && minValue >= 0;
    const isSeparatorOrPlusSign =
      SETTINGS_COUNTER_SEPARATOR_AND_PLUS_SIGN_KEYS.includes(event.key);

    if (isBlockedMinusSign || isSeparatorOrPlusSign) {
      event.preventDefault();
    }
  };

  const handleEscape = () => {
    inputRef.current?.blur();
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleEscape,
    focusId: instanceId,
    dependencies: [handleEscape],
    options: {
      preventDefault: false,
    },
  });

  const handleValueChange = (nextValue: number | null) => {
    if (!isDefined(nextValue)) {
      return;
    }

    const isPersistableValue = isInteger(nextValue) && nextValue >= minValue;

    if (!isPersistableValue) {
      return;
    }

    const nextSettingsValue = Math.min(
      nextValue,
      maxValue ?? Number.POSITIVE_INFINITY,
    );

    if (nextSettingsValue === value) {
      return;
    }

    onChange(nextSettingsValue);
  };

  return (
    <StyledCounterContainer showButtons={showButtons}>
      <NumberStepper
        ref={inputRef}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-roledescription={t`Number field`}
        value={value}
        onValueChange={handleValueChange}
        allowOutOfRange
        min={minValue}
        max={maxValue}
        disabled={disabled}
        showButtons={showButtons}
        decrementLabel={t`Decrease value`}
        incrementLabel={t`Increase value`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </StyledCounterContainer>
  );
};
