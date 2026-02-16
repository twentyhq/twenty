import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from '@blocknote/core';

import { FileBlock } from '@/blocknote-editor/blocks/FileBlock';
import { MentionInlineContent } from '@/blocknote-editor/blocks/MentionInlineContent';

export const BLOCK_SCHEMA = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    file: FileBlock,
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    mention: MentionInlineContent,
  },
});
