import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeysEvent } from 'react-hotkeys-hook/dist/types';
import { HiArrowSmRight } from 'react-icons/hi';
import TextareaAutosize from 'react-textarea-autosize';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/components/buttons/IconButton';

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
  width: 100%;
  padding: 8px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 400;
  line-height: 16px;
  border: none;
  border-radius: 5px;
  background: ${(props) => props.theme.tertiaryBackground};
  color: ${(props) => props.theme.text80};
  overflow: auto;
  resize: none;

  &:focus {
    outline: none;
    border: none;
  }

  &::placeholder {
    color: ${(props) => props.theme.text30};
    font-weight: 400;
  }
`;

// TODO: this messes with the layout, fix it
const StyledBottomRightIconButton = styled.div`
  width: 0px;
  position: relative;
  top: calc(100% - 26.5px);
  right: 26px;
  height: 0;
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
          placeholder={placeholder || 'Write something...'}
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
            icon={<HiArrowSmRight size={15} />}
            disabled={isSendButtonDisabled}
          />
        </StyledBottomRightIconButton>
      </StyledContainer>
    </>
  );
}
