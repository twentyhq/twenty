import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId, useRef } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { NumberInput } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

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

  const handleBlur = () => {
    removeFocusItemFromFocusStackById({ focusId: instanceId });
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
    if (isDefined(nextValue) && nextValue < minValue) {
      return;
    }

    const nextSettingsValue = isDefined(maxValue)
      ? Math.min(nextValue ?? minValue, maxValue)
      : (nextValue ?? minValue);

    if (nextSettingsValue === value) {
      return;
    }

    onChange(nextSettingsValue);
  };

  return (
    <StyledCounterContainer showButtons={showButtons}>
      <NumberInput
        ref={inputRef}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
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
      />
    </StyledCounterContainer>
  );
};
