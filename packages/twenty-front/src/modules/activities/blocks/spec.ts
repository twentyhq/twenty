import { defaultBlockSpecs } from '@blocknote/core';

import { FileBlock } from './FileBlock';

export const blockSpecs: any = {
  ...defaultBlockSpecs,
  file: FileBlock,
};
