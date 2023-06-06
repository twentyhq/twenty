import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeysEvent } from 'react-hotkeys-hook/dist/types';
import { HiArrowSmRight } from 'react-icons/hi';
import TextareaAutosize from 'react-textarea-autosize';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/components/buttons/IconButton';
import { AutosizeTextInput } from '@/ui/components/inputs/AutosizeTextInput';

type OwnProps = {
  commentThreadId: string;
};

const StyledContainer = styled.div`
  display: flex;
  min-height: 32px;
  width: 100%;
`;

export function CommentTextInput({ commentThreadId }: OwnProps) {
  const asd = use;

  function handleSendComment(commentText: string) {
    console.log({ commentText });
  }

  return (
    <>
      <AutosizeTextInput onSend={handleSendComment} />
    </>
  );
}
