/** @jsxImportSource @emotion/react */
import React from 'react';
import { BlockNoteEditor, BlockSchema } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/react';
import { css } from '@emotion/react';

interface BlockEditorProps<BSchema extends BlockSchema> {
  editor: BlockNoteEditor<BSchema> | null;
}

export function BlockEditor<BSchema extends BlockSchema>(
  props: BlockEditorProps<BSchema>,
) {
  const customStyles = (theme: any) => css`
    & .editor-class [class^='_inlineContent']:before {
      color: ${theme.font.color.tertiary};
      font-style: normal !important;
    }
  `;

  return (
    <div css={customStyles}>
      <BlockNoteView {...props} />
    </div>
  );
}
