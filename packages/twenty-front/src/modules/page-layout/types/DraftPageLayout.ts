import { type PageLayout } from '@/page-layout/types/PageLayout';

export type DraftPageLayout = Pick<
  PageLayout,
  | 'id'
  | 'name'
  | 'type'
  | 'objectMetadataId'
  | 'tabs'
  | 'defaultTabToFocusOnMobileAndSidePanelId'
>;
