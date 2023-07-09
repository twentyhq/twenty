/** @jsxImportSource @emotion/react */
import React from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/react';
import { css } from '@emotion/react';

interface BlockEditorProps {
  editor: BlockNoteEditor | null;
}

export function BlockEditor({ editor }: BlockEditorProps) {
  const customStyles = (theme: any) => css`
    & .editor-create-mode [class^='_inlineContent']:before {
      color: ${theme.font.color.tertiary};
      font-style: normal !important;
    }
    & .editor-edit-mode [class^='_inlineContent']:before {
      content: '';
    }
  `;

  return (
    <div css={customStyles}>
      <BlockNoteView editor={editor} />
    </div>
  );
}
