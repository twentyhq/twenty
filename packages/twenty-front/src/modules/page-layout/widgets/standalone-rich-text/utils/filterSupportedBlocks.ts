import { type PartialBlock } from '@blocknote/core';

import { DASHBOARD_BLOCK_SCHEMA } from '@/page-layout/widgets/standalone-rich-text/constants/DashboardBlockSchema';
import { isDefined } from 'twenty-shared/utils';

type DashboardPartialBlock = (typeof DASHBOARD_BLOCK_SCHEMA)['PartialBlock'];
type SupportedBlockType = keyof (typeof DASHBOARD_BLOCK_SCHEMA)['blockSchema'];

const SUPPORTED_BLOCK_TYPES = Object.keys(
  DASHBOARD_BLOCK_SCHEMA.blockSchema,
) as SupportedBlockType[];

const isSupportedBlockType = (type: string): type is SupportedBlockType =>
  SUPPORTED_BLOCK_TYPES.includes(type as SupportedBlockType);

const filterBlockRecursively = (
  block: PartialBlock,
): DashboardPartialBlock | undefined => {
  if (!isDefined(block.type) || !isSupportedBlockType(block.type)) {
    return undefined;
  }

  return {
    ...block,
    children: block.children
      ?.map(filterBlockRecursively)
      .filter(isDefined) as DashboardPartialBlock[],
  } as DashboardPartialBlock;
};

export const filterSupportedBlocks = (
  blocks: PartialBlock[] | undefined,
): DashboardPartialBlock[] | undefined => {
  if (!isDefined(blocks)) {
    return undefined;
  }

  return blocks.map(filterBlockRecursively).filter(isDefined);
};
