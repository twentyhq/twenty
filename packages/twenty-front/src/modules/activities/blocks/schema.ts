import { BlockSchema, defaultBlockSchema } from '@blocknote/core';

import { FileBlock } from './FileBlock';

export const blockSchema: BlockSchema = {
  ...defaultBlockSchema,
  file: FileBlock.config,
};
