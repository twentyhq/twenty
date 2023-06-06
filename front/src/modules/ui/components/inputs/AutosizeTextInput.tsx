import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeysEvent } from 'react-hotkeys-hook/dist/types';
import { HiArrowSmRight } from 'react-icons/hi';
import TextareaAutosize from 'react-textarea-autosize';
import styled from '@emotion/styled';

import { IconButton } from '../buttons/IconButton';

type OwnProps = {
  onSend?: (text: string) => void;
  placeholder?: string;
};

const StyledContainer = styled.div`
  display: flex;
  min-height: 32px;
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

const StyledBottomRightIconButton = styled.div`
  width: 0px;
  position: relative;
  top: calc(100% - 26.5px);
  right: 26px;
`;

export function AutosizeTextInput({ placeholder, onSend }: OwnProps) {
  const [text, setText] = useState('');

  const isSendButtonDisabled = !text;

  useHotkeys(
    ['shift+enter', 'enter'],
    (event: KeyboardEvent, handler: HotkeysEvent) => {
      if (handler.shift) {
        return;
      } else {
        event.preventDefault();

        onSend?.(text);

        setText('');
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [onSend],
  );

  useHotkeys(
    'esc',
    (event: KeyboardEvent) => {
      event.preventDefault();

      setText('');
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [onSend],
  );

  function handleInputChange(event: React.FormEvent<HTMLTextAreaElement>) {
    const newText = event.currentTarget.value;

    setText(newText);
  }

  function handleOnClickSendButton() {
    onSend?.(text);

    setText('');
  }

  return (
    <>
      <StyledContainer>
        <StyledTextArea
          placeholder={placeholder || 'Write something...'}
          maxRows={5}
          onChange={handleInputChange}
          value={text}
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
