import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/react';
import styled from '@emotion/styled';

interface BlockEditorProps {
  editor: BlockNoteEditor;
}

const StyledEditor = styled.div`
  min-height: 200px;
  width: 100%;
  & .editor {
    background: ${({ theme }) => theme.background.primary};
    font-size: 13px;
    color: ${({ theme }) => theme.font.color.primary};
  }
  & .editor [class^='_inlineContent']:before {
    color: ${({ theme }) => theme.font.color.tertiary};
    font-style: normal !important;
  }
`;

export function BlockEditor({ editor }: BlockEditorProps) {
  return (
    <StyledEditor>
      <BlockNoteView editor={editor} />
    </StyledEditor>
  );
}
