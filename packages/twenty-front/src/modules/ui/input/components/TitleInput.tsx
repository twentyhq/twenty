import { TextInput, TextInputSize } from '@/ui/input/components/TextInput';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import styled from '@emotion/styled';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

type InputProps = {
  instanceId: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  onEscape?: () => void;
  onClickOutside?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  sizeVariant?: TextInputSize;
};

export type TitleInputProps = {
  disabled?: boolean;
} & InputProps;

const StyledDiv = styled.div<{
  sizeVariant: TextInputSize;
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
  instanceId,
  value,
  onChange,
  placeholder,
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

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleLeaveFocus = () => {
    setIsOpened(false);
    removeFocusItemFromFocusStackById({ focusId: instanceId });
  };

  useRegisterInputEvents<string>({
    focusId: instanceId,
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
  });

  return (
    <TextInput
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
  instanceId,
  disabled,
  value,
  sizeVariant = 'md',
  onChange,
  placeholder,
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: TitleInputProps) => {
  const [isOpened, setIsOpened] = useState(false);

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  return (
    <>
      {isOpened ? (
        <Input
          instanceId={instanceId}
          sizeVariant={sizeVariant}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
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
              pushFocusItemToFocusStack({
                focusId: instanceId,
                component: {
                  type: FocusComponentType.TEXT_INPUT,
                  instanceId: instanceId,
                },
                globalHotkeysConfig: {
                  enableGlobalHotkeysConflictingWithKeyboard: false,
                },
              });
            }
          }}
        >
          <OverflowingTextWithTooltip text={value || placeholder} />
        </StyledDiv>
      )}
    </>
  );
};
