import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';

import { FileBlock } from './FileBlock';

export const blockSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    file: FileBlock,
  },
});
