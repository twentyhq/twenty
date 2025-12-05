import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from '@blocknote/core';

import { FileBlock } from '../components/FileBlock';
import { MentionInlineContent } from '../components/MentionInlineContent';

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
