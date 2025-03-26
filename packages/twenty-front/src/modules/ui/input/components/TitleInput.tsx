import {
  TextInputV2,
  TextInputV2Size,
} from '@/ui/input/components/TextInputV2';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import styled from '@emotion/styled';
import { OverflowingTextWithTooltip } from 'twenty-ui';

export type TitleInputProps = {
  sizeVariant: TextInputV2Size;
  draftValue?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  hotkeyScope: string;
  disabled?: boolean;
  onEnter?: () => void;
  onEscape?: () => void;
  onClickOutside?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
};

const StyledDiv = styled.div`
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  height: 28px;
  padding: ${({ theme }) => theme.spacing(0, 1.25)};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const TitleInput = ({
  disabled,
  sizeVariant,
  draftValue,
  onChange,
  placeholder,
  hotkeyScope,
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: TitleInputProps) => {
  const wrapperRef = useRef<HTMLInputElement>(null);

  const [isOpened, setIsOpened] = useState(false);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (isDefined(draftValue)) {
      event.target.select();
    }
  };

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleLeaveFocus = () => {
    setIsOpened(false);
    goBackToPreviousHotkeyScope();
  };

  useRegisterInputEvents<string>({
    inputRef: wrapperRef,
    inputValue: draftValue ?? '',
    onEnter: () => {
      handleLeaveFocus();
      onEnter?.();
    },
    onEscape: () => {
      handleLeaveFocus();
      onEscape?.();
    },
    onClickOutside: () => {
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
    <div ref={wrapperRef}>
      {isOpened ? (
        <TextInputV2
          autoGrow
          sizeVariant={sizeVariant}
          inheritFontStyles
          value={draftValue ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={handleFocus}
          autoFocus
        />
      ) : (
        <StyledDiv
          onClick={() => {
            if (!disabled) {
              setIsOpened(true);
              setHotkeyScopeAndMemorizePreviousScope(hotkeyScope);
            }
          }}
        >
          <OverflowingTextWithTooltip text={draftValue ?? ''} />
        </StyledDiv>
      )}
    </div>
  );
};
