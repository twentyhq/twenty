import { v4 } from 'uuid';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PAGE_LAYOUT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

type PageLayoutSeed = {
  id: string;
  name: string;
  type: PageLayoutType;
  objectMetadataId: string | null;
  workspaceId: string;
  universalIdentifier: string;
  applicationId: string;
};

export const getPageLayoutDataSeeds = (
  workspaceId: string,
  applicationId: string,
): PageLayoutSeed[] => [
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.SALES_DASHBOARD),
    name: 'Sales Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
    universalIdentifier: v4(),
    applicationId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.CUSTOMER_DASHBOARD),
    name: 'Customer Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
    universalIdentifier: v4(),
    applicationId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD),
    name: 'Team Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
    universalIdentifier: v4(),
    applicationId,
  },
];
