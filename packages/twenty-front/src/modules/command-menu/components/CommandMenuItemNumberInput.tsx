import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { TextInput } from '@/ui/input/components/TextInput';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

type CommandMenuItemNumberInputProps = {
  id: string;
  label: string;
  Icon?: IconComponent;
  value: string;
  onChange: (value: number | null) => void;
  onValidate?: (value: number | null) => boolean;
  placeholder?: string;
};

const StyledRightAlignedTextInput = styled(TextInput)`
  input {
    text-align: right;
  }
`;

export const CommandMenuItemNumberInput = ({
  id,
  label,
  Icon,
  value,
  onChange,
  onValidate,
  placeholder,
}: CommandMenuItemNumberInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const focusId = `${id}-input`;
  const [draftValue, setDraftValue] = useState(value);
  const [hasError, setHasError] = useState(false);

  const currentFocusId = useRecoilValue(currentFocusIdSelector);
  const isNumberInputCurrentlyFocused = currentFocusId === focusId;

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleCommit = (draftValue: string) => {
    if (!canBeCastAsNumberOrNull(draftValue)) {
      setHasError(true);
      return;
    }

    const numericValue = castAsNumberOrNull(draftValue);

    if (isDefined(onValidate)) {
      const isValid = onValidate(numericValue);
      if (!isValid) {
        setHasError(true);
        return;
      }
    }

    onChange(numericValue);
    setHasError(false);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
    pushFocusItemToFocusStack({
      focusId,
      component: {
        type: FocusComponentType.TEXT_INPUT,
        instanceId: focusId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleBlur = () => {
    removeFocusItemFromFocusStackById({ focusId });
  };

  const handleEscape = () => {
    setDraftValue(value);
    inputRef.current?.blur();
  };

  const handleClickOutside = () => {
    handleCommit(draftValue);
  };

  const handleEnter = () => {
    handleCommit(draftValue);
    inputRef.current?.blur();
  };

  useRegisterInputEvents<string>({
    focusId,
    inputRef: inputRef,
    inputValue: draftValue,
    onEscape: handleEscape,
    onEnter: handleEnter,
    onClickOutside: isNumberInputCurrentlyFocused
      ? handleClickOutside
      : undefined,
  });

  const handleChange = (text: string) => {
    setDraftValue(text);
    if (hasError) {
      setHasError(false);
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <CommandMenuItem
      id={id}
      label={label}
      Icon={Icon}
      onClick={focusInput}
      RightComponent={
        <StyledRightAlignedTextInput
          ref={inputRef}
          value={draftValue}
          sizeVariant="sm"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          error={hasError ? ' ' : undefined}
          noErrorHelper
          textClickOutsideId={focusId}
        />
      }
    />
  );
};
