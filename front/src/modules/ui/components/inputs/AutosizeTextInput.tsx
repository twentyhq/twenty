import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeysEvent } from 'react-hotkeys-hook/dist/types';
import TextareaAutosize from 'react-textarea-autosize';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/components/buttons/IconButton';
import { IconArrowRight } from '@/ui/icons/index';

const MAX_ROWS = 5;

type OwnProps = {
  onValidate?: (text: string) => void;
  minRows?: number;
  placeholder?: string;
};

const StyledContainer = styled.div`
  display: flex;

  width: 100%;
`;

const StyledTextArea = styled(TextareaAutosize)`
  background: ${({ theme }) => theme.background.tertiary};
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
const StyledBottomRightIconButton = styled.div`
  height: 0;
  position: relative;
  right: 26px;
  top: calc(100% - 26.5px);
  width: 0px;
`;

export function AutosizeTextInput({
  placeholder,
  onValidate,
  minRows = 1,
}: OwnProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState('');

  const isSendButtonDisabled = !text;

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
    <>
      <StyledContainer>
        <StyledTextArea
          placeholder={placeholder || 'Write a comment'}
          maxRows={MAX_ROWS}
          minRows={computedMinRows}
          onChange={handleInputChange}
          value={text}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <StyledBottomRightIconButton>
          <IconButton
            onClick={handleOnClickSendButton}
            icon={<IconArrowRight size={15} />}
            disabled={isSendButtonDisabled}
          />
        </StyledBottomRightIconButton>
      </StyledContainer>
    </>
  );
}
