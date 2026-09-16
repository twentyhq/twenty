import { isDefined } from 'twenty-shared/utils';

export type FilterableBlock = {
  type?: string;
  children?: FilterableBlock[];
};

const filterBlockRecursively = <TBlock extends FilterableBlock>(
  block: TBlock,
  supportedBlockTypes: string[],
): TBlock | undefined => {
  if (!isDefined(block.type) || !supportedBlockTypes.includes(block.type)) {
    return undefined;
  }

  return {
    ...block,
    children: block.children
      ?.map((childBlock) =>
        filterBlockRecursively(childBlock, supportedBlockTypes),
      )
      .filter(isDefined),
  };
};

export const filterBlocksSupportedBySchema = <TBlock extends FilterableBlock>(
  blocks: TBlock[] | undefined,
  blockSchema: Record<string, unknown>,
): TBlock[] | undefined => {
  if (!isDefined(blocks)) {
    return undefined;
  }

  const supportedBlockTypes = Object.keys(blockSchema);

  return blocks
    .map((block) => filterBlockRecursively(block, supportedBlockTypes))
    .filter(isDefined);
};
