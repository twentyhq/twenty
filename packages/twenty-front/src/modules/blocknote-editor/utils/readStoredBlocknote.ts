import { type PartialBlock } from '@blocknote/core';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { countBlocksDeep } from '@/blocknote-editor/utils/countBlocksDeep';
import { filterBlocksSupportedBySchema } from '@/blocknote-editor/utils/filterBlocksSupportedBySchema';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';

export type StoredBlocknoteReadResult = {
  blocks: PartialBlock[] | undefined;
  hasUnreadableStoredValue: boolean;
};

export const readStoredBlocknote = (
  blocknote?: string | null,
  logContext?: string,
): StoredBlocknoteReadResult => {
  const parsedBlocks = parseInitialBlocknote(blocknote, logContext);

  const supportedBlocks = filterBlocksSupportedBySchema(
    parsedBlocks,
    BLOCK_SCHEMA.blockSchema,
  );

  return {
    blocks: isNonEmptyArray(supportedBlocks) ? supportedBlocks : undefined,
    hasUnreadableStoredValue:
      countBlocksDeep(supportedBlocks) < countBlocksDeep(parsedBlocks),
  };
};
