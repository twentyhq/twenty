import { ClipboardEvent } from 'react';
import { filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView, SuggestionMenuController } from '@blocknote/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { blockSchema } from '@/activities/blocks/schema';
import { getSlashMenu } from '@/activities/blocks/slashMenu';
import {
  CustomSlashMenu,
  SuggestionItem,
} from '@/ui/input/editor/components/CustomSlashMenu';

interface BlockEditorProps {
  editor: typeof blockSchema.BlockNoteEditor;
  onFocus?: () => void;
  onBlur?: () => void;
  onPaste?: (event: ClipboardEvent) => void;
  onChange?: () => void;
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
  onFocus,
  onBlur,
  onChange,
  onPaste,
}: BlockEditorProps) => {
  const theme = useTheme();
  const blockNoteTheme = theme.name === 'light' ? 'light' : 'dark';

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const handleChange = () => {
    onChange?.();
  };

  const handlePaste = (event: ClipboardEvent) => {
    onPaste?.(event);
  };

  return (
    <StyledEditor>
      <BlockNoteView
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={handlePaste}
        onChange={handleChange}
        editor={editor}
        theme={blockNoteTheme}
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter={'/'}
          getItems={async (query) =>
            filterSuggestionItems<SuggestionItem>(getSlashMenu(editor), query)
          }
          suggestionMenuComponent={CustomSlashMenu}
        />
      </BlockNoteView>
    </StyledEditor>
  );
};
