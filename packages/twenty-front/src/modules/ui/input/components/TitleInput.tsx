import {
  TextInputV2,
  TextInputV2Size,
} from '@/ui/input/components/TextInputV2';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import styled from '@emotion/styled';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

type InputProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hotkeyScope?: string;
  onEnter?: () => void;
  onEscape?: () => void;
  onClickOutside?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  sizeVariant?: TextInputV2Size;
};

export type TitleInputProps = {
  disabled?: boolean;
} & InputProps;

const StyledDiv = styled.div<{
  sizeVariant: TextInputV2Size;
  disabled?: boolean;
}>`
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  overflow: hidden;
  height: ${({ sizeVariant }) =>
    sizeVariant === 'xs'
      ? '20px'
      : sizeVariant === 'sm'
        ? '24px'
        : sizeVariant === 'md'
          ? '28px'
          : '32px'};
  padding: ${({ theme }) => theme.spacing(0, 1.25)};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  :hover {
    background: ${({ theme, disabled }) =>
      disabled ? 'inherit' : theme.background.transparent.light};
  }
`;

const Input = ({
  value,
  onChange,
  placeholder,
  hotkeyScope = 'title-input',
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
  setIsOpened,
  sizeVariant,
}: InputProps & { setIsOpened: (isOpened: boolean) => void }) => {
  const wrapperRef = useRef<HTMLInputElement>(null);

  const [draftValue, setDraftValue] = useState(value ?? '');

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (isDefined(value)) {
      event.target.select();
    }
  };

  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const handleLeaveFocus = () => {
    setIsOpened(false);
    goBackToPreviousHotkeyScope();
  };

  useRegisterInputEvents<string>({
    inputRef: wrapperRef,
    inputValue: draftValue,
    onEnter: () => {
      handleLeaveFocus();
      onEnter?.();
    },
    onEscape: () => {
      handleLeaveFocus();
      onEscape?.();
    },
    onClickOutside: (event) => {
      event.stopImmediatePropagation();
      handleLeaveFocus();
      onClickOutside?.();
    },
    onTab: () => {
      handleLeaveFocus();
      onTab?.();
    },
    onShiftTab: () => {
      handleLeaveFocus();
      onShiftTab?.();
    },
    hotkeyScope: hotkeyScope,
  });

  return (
    <TextInputV2
      ref={wrapperRef}
      autoGrow
      sizeVariant={sizeVariant}
      inheritFontStyles
      value={draftValue}
      onChange={(text) => {
        setDraftValue(text);
        onChange?.(text);
      }}
      placeholder={placeholder}
      onFocus={handleFocus}
      autoFocus
    />
  );
};

export const TitleInput = ({
  disabled,
  value,
  sizeVariant = 'md',
  onChange,
  placeholder,
  hotkeyScope = 'title-input',
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: TitleInputProps) => {
  const [isOpened, setIsOpened] = useState(false);

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  return (
    <>
      {isOpened ? (
        <Input
          sizeVariant={sizeVariant}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          hotkeyScope={hotkeyScope}
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
          setIsOpened={setIsOpened}
        />
      ) : (
        <StyledDiv
          sizeVariant={sizeVariant}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpened(true);
              setHotkeyScopeAndMemorizePreviousScope(hotkeyScope);
            }
          }}
        >
          <OverflowingTextWithTooltip text={value || placeholder} />
        </StyledDiv>
      )}
    </>
  );
};
