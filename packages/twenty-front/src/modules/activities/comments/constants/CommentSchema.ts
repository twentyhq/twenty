import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from '@blocknote/core';

import { Mention } from '@/activities/comments/components/Mention';

export const COMMENT_SCHEMA = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    mention: Mention,
  },
});

export type CommentEditor = typeof COMMENT_SCHEMA.BlockNoteEditor;
