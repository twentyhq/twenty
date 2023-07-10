import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/react';
import styled from '@emotion/styled';

interface BlockEditorProps {
  editor: BlockNoteEditor | null;
}

const StyledEditor = styled.div`
  display: flex;
  & .editor-create-mode,
  .editor-edit-mode {
    background: ${({ theme }) => theme.background.primary};
  }
  & .editor-create-mode [class^='_inlineContent']:before {
    color: ${({ theme }) => theme.font.color.tertiary};
    font-style: normal !important;
  }
  & .editor-edit-mode [class^='_inlineContent']:before {
    content: '';
  }
`;

export function BlockEditor({ editor }: BlockEditorProps) {
  return (
    <StyledEditor>
      <BlockNoteView editor={editor} />
    </StyledEditor>
  );
}
