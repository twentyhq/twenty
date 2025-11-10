import { PageLayoutType } from '~/generated/graphql';

import { type DraftPageLayout } from '@/page-layout/types/draft-page-layout';

export const PAGE_LAYOUT_DRAFT_COMPONENT_STATE_DEFAULT_VALUE: DraftPageLayout =
  {
    id: '',
    name: '',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    tabs: [],
  };
