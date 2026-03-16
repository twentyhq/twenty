import { type FlatPageLayout } from '@/metadata-store/types/FlatPageLayout';
import { type FlatPageLayoutTab } from '@/metadata-store/types/FlatPageLayoutTab';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { type PageLayout } from '@/page-layout/types/PageLayout';

type SplitResult = {
  flatPageLayouts: FlatPageLayout[];
  flatPageLayoutTabs: FlatPageLayoutTab[];
  flatPageLayoutWidgets: FlatPageLayoutWidget[];
};

export const splitPageLayoutWithRelated = (
  pageLayouts: PageLayout[],
): SplitResult => {
  const flatPageLayouts: FlatPageLayout[] = [];
  const flatPageLayoutTabs: FlatPageLayoutTab[] = [];
  const flatPageLayoutWidgets: FlatPageLayoutWidget[] = [];

  for (const pageLayout of pageLayouts) {
    const { tabs = [], ...pageLayoutProperties } = pageLayout;

    flatPageLayouts.push(pageLayoutProperties);

    for (const tab of tabs) {
      const { widgets = [], ...tabProperties } = tab;

      flatPageLayoutTabs.push({
        ...tabProperties,
        pageLayoutId: pageLayout.id,
      });

      for (const widget of widgets) {
        flatPageLayoutWidgets.push({
          ...widget,
          pageLayoutTabId: tab.id,
        });
      }
    }
  }

  return {
    flatPageLayouts,
    flatPageLayoutTabs,
    flatPageLayoutWidgets,
  };
};
