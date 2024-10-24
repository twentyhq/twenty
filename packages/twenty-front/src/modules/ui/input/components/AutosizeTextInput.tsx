import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { HotkeysEvent } from 'react-hotkeys-hook/dist/types';
import TextareaAutosize from 'react-textarea-autosize';
import { Key } from 'ts-key-enum';
import { Button, IconArrowRight, RoundedIconButton } from 'twenty-ui';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { InputHotkeyScope } from '../types/InputHotkeyScope';

const MAX_ROWS = 5;

export enum AutosizeTextInputVariant {
  Default = 'default',
  Icon = 'icon',
  Button = 'button',
}

type AutosizeTextInputProps = {
  onValidate?: (text: string) => void;
  minRows?: number;
  placeholder?: string;
  onFocus?: () => void;
  variant?: AutosizeTextInputVariant;
  buttonTitle?: string;
  value?: string;
  className?: string;
  onBlur?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
};

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledInputContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
`;

type StyledTextAreaProps = {
  variant: AutosizeTextInputVariant;
};

const StyledTextArea = styled(TextareaAutosize)<StyledTextAreaProps>`
  background: ${({ theme, variant }) =>
    variant === AutosizeTextInputVariant.Button
      ? 'transparent'
      : theme.background.tertiary};
  border: none;
  border-radius: 5px;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: 16px;
  overflow: auto;

  &:focus {
    border: none;
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.regular};
  }
  padding: ${({ variant }) =>
    variant === AutosizeTextInputVariant.Button ? '8px 0' : '8px'};
  resize: none;
  width: 100%;
`;

// TODO: this messes with the layout, fix it
const StyledBottomRightRoundedIconButton = styled.div`
  height: 0;
  position: relative;
  right: 26px;
  top: 6px;
  width: 0px;
`;

const StyledSendButton = styled(Button)`
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledWordCounter = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 150%;
  width: 100%;
`;

type StyledBottomContainerProps = {
  isTextAreaHidden: boolean;
};

const StyledBottomContainer = styled.div<StyledBottomContainerProps>`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme, isTextAreaHidden }) =>
    isTextAreaHidden ? 0 : theme.spacing(4)};
`;

const StyledCommentText = styled.div`
  cursor: text;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

export const AutosizeTextInput = ({
  placeholder,
  onValidate,
  minRows = 1,
  onFocus,
  variant = AutosizeTextInputVariant.Default,
  buttonTitle,
  value = '',
  className,
  onBlur,
  autoFocus,
  disabled,
}: AutosizeTextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(
    variant === AutosizeTextInputVariant.Button,
  );
  const [text, setText] = useState(value);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const isSendButtonDisabled = !text;
  const words = text.split(/\s|\n/).filter((word) => word).length;

  useScopedHotkeys(
    ['shift+enter', 'enter'],
    (event: KeyboardEvent, handler: HotkeysEvent) => {
      if (handler.shift || !isFocused) {
        return;
      } else {
        event.preventDefault();

        onValidate?.(text);

        setText('');
      }
    },
    InputHotkeyScope.TextInput,
    [onValidate, text, setText, isFocused],
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
  );

  useScopedHotkeys(
    Key.Escape,
    (event: KeyboardEvent) => {
      if (!isFocused) {
        return;
      }

      event.preventDefault();

      setText('');
      goBackToPreviousHotkeyScope();
      textInputRef.current?.blur();
    },
    InputHotkeyScope.TextInput,
    [onValidate, setText, isFocused],
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
  );

  const handleInputChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newText = event.currentTarget.value;

    setText(newText);
  };

  const handleOnClickSendButton = () => {
    onValidate?.(text);

    setText('');
  };

  const handleFocus = () => {
    onFocus?.();
    setIsFocused(true);
    setHotkeyScopeAndMemorizePreviousScope(InputHotkeyScope.TextInput);
  };

  const handleBlur = () => {
    onBlur?.();
    setIsFocused(false);
    goBackToPreviousHotkeyScope();
  };

  const computedMinRows = minRows > MAX_ROWS ? MAX_ROWS : minRows;

  return (
    <>
      <StyledContainer className={className}>
        <StyledInputContainer>
          {!isHidden && (
            <StyledTextArea
              ref={textInputRef}
              autoFocus={
                autoFocus || variant === AutosizeTextInputVariant.Button
              }
              placeholder={placeholder ?? 'Write a comment'}
              maxRows={MAX_ROWS}
              minRows={computedMinRows}
              onChange={handleInputChange}
              value={text}
              onFocus={handleFocus}
              onBlur={handleBlur}
              variant={variant}
              disabled={disabled}
            />
          )}
          {variant === AutosizeTextInputVariant.Icon && (
            <StyledBottomRightRoundedIconButton>
              <RoundedIconButton
                onClick={handleOnClickSendButton}
                Icon={IconArrowRight}
                disabled={isSendButtonDisabled}
              />
            </StyledBottomRightRoundedIconButton>
          )}
        </StyledInputContainer>

        {variant === AutosizeTextInputVariant.Button && (
          <StyledBottomContainer isTextAreaHidden={isHidden}>
            <StyledWordCounter>
              {isHidden ? (
                <StyledCommentText
                  onClick={() => {
                    setIsHidden(false);
                    onFocus?.();
                  }}
                >
                  Write a comment
                </StyledCommentText>
              ) : (
                `${words} word${words === 1 ? '' : 's'}`
              )}
            </StyledWordCounter>
            <StyledSendButton
              title={buttonTitle ?? 'Comment'}
              disabled={isSendButtonDisabled}
              onClick={handleOnClickSendButton}
            />
          </StyledBottomContainer>
        )}
      </StyledContainer>
    </>
  );
};
