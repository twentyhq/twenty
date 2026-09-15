import { type PartialBlock } from '@blocknote/core';
import { isDefined } from 'twenty-shared/utils';

import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';

type SupportedBlockType = keyof (typeof BLOCK_SCHEMA)['blockSchema'];

const SUPPORTED_BLOCK_TYPES = Object.keys(
  BLOCK_SCHEMA.blockSchema,
) as SupportedBlockType[];

const isSupportedBlockType = (type: string): type is SupportedBlockType =>
  SUPPORTED_BLOCK_TYPES.includes(type as SupportedBlockType);

const filterBlockRecursively = (
  block: PartialBlock,
): PartialBlock | undefined => {
  if (!isDefined(block.type) || !isSupportedBlockType(block.type)) {
    return undefined;
  }

  return {
    ...block,
    children: block.children?.map(filterBlockRecursively).filter(isDefined),
  } as PartialBlock;
};

export const filterBlocksSupportedByBlockSchema = (
  blocks: PartialBlock[] | undefined,
): PartialBlock[] | undefined => {
  if (!isDefined(blocks)) {
    return undefined;
  }

  const supportedBlocks = blocks.map(filterBlockRecursively).filter(isDefined);

  return supportedBlocks.length > 0 ? supportedBlocks : undefined;
};
