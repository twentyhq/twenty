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
import { type IconComponent } from 'twenty-ui/display';

type CommandMenuItemTextInputProps = {
  id: string;
  label: string;
  Icon?: IconComponent;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const StyledRightAlignedTextInput = styled(TextInput)`
  input {
    text-align: right;
  }
`;

export const CommandMenuItemTextInput = ({
  id,
  label,
  Icon,
  value,
  onChange,
  placeholder,
}: CommandMenuItemTextInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const focusId = `${id}-input`;
  const [draftValue, setDraftValue] = useState(value);

  const currentFocusId = useRecoilValue(currentFocusIdSelector);
  const isTextInputCurrentlyFocused = currentFocusId === focusId;

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

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

  const handleEnter = () => {
    onChange(draftValue);
    inputRef.current?.blur();
  };

  const handleClickOutside = () => {
    onChange(draftValue);
  };

  useRegisterInputEvents<string>({
    focusId,
    inputRef: inputRef,
    inputValue: draftValue,
    onEscape: handleEscape,
    onEnter: handleEnter,
    onClickOutside: isTextInputCurrentlyFocused
      ? handleClickOutside
      : undefined,
  });

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
          onChange={setDraftValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          textClickOutsideId={focusId}
        />
      }
    />
  );
};
