import { type PartialBlock } from '@blocknote/core';

import { filterBlocksSupportedBySchema } from '@/blocknote-editor/utils/filterBlocksSupportedBySchema';
import { DASHBOARD_BLOCK_SCHEMA } from '@/page-layout/widgets/standalone-rich-text/constants/DashboardBlockSchema';

type DashboardPartialBlock = (typeof DASHBOARD_BLOCK_SCHEMA)['PartialBlock'];

export const filterSupportedBlocks = (
  blocks: PartialBlock[] | undefined,
): DashboardPartialBlock[] | undefined =>
  filterBlocksSupportedBySchema(blocks, DASHBOARD_BLOCK_SCHEMA.blockSchema) as
    | DashboardPartialBlock[]
    | undefined;
