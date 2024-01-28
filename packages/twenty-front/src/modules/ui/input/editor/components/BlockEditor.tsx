import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

interface BlockEditorProps {
  editor: BlockNoteEditor;
  editorRef: React.RefObject<HTMLDivElement>;
  onFocus?: () => void;
  onBlur?: () => void;
}

const StyledEditor = styled.div`
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

export const BlockEditor = ({
  editor,
  editorRef,
  onFocus,
  onBlur,
}: BlockEditorProps) => {
  const theme = useTheme();
  const blockNoteTheme = theme.name === 'light' ? 'light' : 'dark';

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  return (
    <StyledEditor ref={editorRef}>
      <BlockNoteView
        onFocus={handleFocus}
        onBlur={handleBlur}
        editor={editor}
        theme={blockNoteTheme}
      />
    </StyledEditor>
  );
};
