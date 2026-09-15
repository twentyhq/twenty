import { type BlockSchema, type PartialBlock } from '@blocknote/core';
import { isDefined } from 'twenty-shared/utils';

const filterBlockRecursively = (
  block: PartialBlock,
  supportedBlockTypes: string[],
): PartialBlock | undefined => {
  if (
    !isDefined(block.type) ||
    !supportedBlockTypes.includes(block.type as string)
  ) {
    return undefined;
  }

  return {
    ...block,
    children: block.children
      ?.map((childBlock) =>
        filterBlockRecursively(childBlock, supportedBlockTypes),
      )
      .filter(isDefined),
  } as PartialBlock;
};

export const filterBlocksSupportedBySchema = (
  blocks: PartialBlock[] | undefined,
  blockSchema: BlockSchema,
): PartialBlock[] | undefined => {
  if (!isDefined(blocks)) {
    return undefined;
  }

  const supportedBlockTypes = Object.keys(blockSchema);

  return blocks
    .map((block) => filterBlockRecursively(block, supportedBlockTypes))
    .filter(isDefined);
};
