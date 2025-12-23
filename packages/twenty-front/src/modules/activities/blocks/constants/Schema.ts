import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';

import { FileBlock } from '@/modules/activities/blocks/components/FileBlock';

export const BLOCK_SCHEMA = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    file: FileBlock,
  },
});
