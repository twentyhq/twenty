import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayout } from '@/page-layout/types/PageLayout';

export const toDraftPageLayout = (pageLayout: PageLayout): DraftPageLayout => ({
  id: pageLayout.id,
  name: pageLayout.name,
  type: pageLayout.type,
  objectMetadataId: pageLayout.objectMetadataId,
  tabs: pageLayout.tabs,
  defaultTabToFocusOnMobileAndSidePanelId:
    pageLayout.defaultTabToFocusOnMobileAndSidePanelId,
});
