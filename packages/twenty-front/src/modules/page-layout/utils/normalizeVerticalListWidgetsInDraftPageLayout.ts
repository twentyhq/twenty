import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { reindexWidgetsToVerticalListPositions } from '@/page-layout/utils/reindexWidgetsToVerticalListPositions';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const normalizeVerticalListWidgetsInDraftPageLayout = (
  draftPageLayout: DraftPageLayout,
): DraftPageLayout => ({
  ...draftPageLayout,
  tabs: draftPageLayout.tabs.map((tab) =>
    tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
      ? {
          ...tab,
          widgets: reindexWidgetsToVerticalListPositions(
            sortWidgetsByVerticalListPosition(tab.widgets),
          ),
        }
      : tab,
  ),
});
