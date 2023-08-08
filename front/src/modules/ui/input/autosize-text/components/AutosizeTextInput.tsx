import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeysEvent } from 'react-hotkeys-hook/dist/types';
import TextareaAutosize from 'react-textarea-autosize';
import styled from '@emotion/styled';

import { Button } from '@/ui/button/components/Button';
import { RoundedIconButton } from '@/ui/button/components/RoundedIconButton';
import { IconArrowRight } from '@/ui/icon/index';

const MAX_ROWS = 5;

export enum AutosizeTextInputVariant {
  Icon = 'icon',
  Button = 'button',
}

type OwnProps = {
  onValidate?: (text: string) => void;
  minRows?: number;
  placeholder?: string;
  onFocus?: () => void;
  variant?: AutosizeTextInputVariant;
  buttonTitle?: string;
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
  padding: 8px;
  resize: none;
  width: 100%;

  &:focus {
    border: none;
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.regular};
  }
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

export function AutosizeTextInput({
  placeholder,
  onValidate,
  minRows = 1,
  onFocus,
  variant = AutosizeTextInputVariant.Icon,
  buttonTitle,
}: OwnProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(
    variant === AutosizeTextInputVariant.Button,
  );
  const [text, setText] = useState('');

  const isSendButtonDisabled = !text;
  const words = text.split(/\s|\n/).length;

  useHotkeys(
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
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [onValidate, text, setText, isFocused],
  );

  useHotkeys(
    'esc',
    (event: KeyboardEvent) => {
      if (!isFocused) {
        return;
      }

      event.preventDefault();

      setText('');
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [onValidate, setText, isFocused],
  );

  function handleInputChange(event: React.FormEvent<HTMLTextAreaElement>) {
    const newText = event.currentTarget.value;

    setText(newText);
  }

  function handleOnClickSendButton() {
    onValidate?.(text);

    setText('');
  }

  const computedMinRows = minRows > MAX_ROWS ? MAX_ROWS : minRows;

  return (
    <StyledContainer>
      <StyledInputContainer>
        {!isHidden && (
          <StyledTextArea
            autoFocus
            placeholder={placeholder || 'Write a comment'}
            maxRows={MAX_ROWS}
            minRows={computedMinRows}
            onChange={handleInputChange}
            value={text}
            onFocus={() => {
              onFocus?.();
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            variant={variant}
          />
        )}
        {variant === AutosizeTextInputVariant.Icon && (
          <StyledBottomRightRoundedIconButton>
            <RoundedIconButton
              onClick={handleOnClickSendButton}
              icon={<IconArrowRight size={15} />}
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
  );
}
