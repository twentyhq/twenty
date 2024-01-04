import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/react';
import { useTheme } from '@emotion/react';
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

export const BlockEditor = ({ editor }: BlockEditorProps) => {
  const theme = useTheme();
  const blockNoteTheme = theme.name === 'light' ? 'light' : 'dark';
  return (
    <StyledEditor>
      <BlockNoteView editor={editor} theme={blockNoteTheme} />
    </StyledEditor>
  );
};
