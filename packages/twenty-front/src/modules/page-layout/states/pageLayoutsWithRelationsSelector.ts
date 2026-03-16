import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatPageLayout } from '@/metadata-store/types/FlatPageLayout';
import { type FlatPageLayoutTab } from '@/metadata-store/types/FlatPageLayoutTab';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';

export const pageLayoutsWithRelationsSelector = createAtomSelector<
  PageLayout[]
>({
  key: 'pageLayoutsWithRelationsSelector',
  get: ({ get }) => {
    const flatPageLayouts = get(metadataStoreState, 'pageLayouts')
      .current as FlatPageLayout[];
    const allFlatTabs = get(metadataStoreState, 'pageLayoutTabs')
      .current as FlatPageLayoutTab[];
    const allFlatWidgets = get(metadataStoreState, 'pageLayoutWidgets')
      .current as FlatPageLayoutWidget[];

    const tabsByPageLayoutId = new Map<string, FlatPageLayoutTab[]>();
    const widgetsByTabId = new Map<string, FlatPageLayoutWidget[]>();

    for (const tab of allFlatTabs) {
      const existing = tabsByPageLayoutId.get(tab.pageLayoutId);

      if (isDefined(existing)) {
        existing.push(tab);
      } else {
        tabsByPageLayoutId.set(tab.pageLayoutId, [tab]);
      }
    }

    for (const widget of allFlatWidgets) {
      const existing = widgetsByTabId.get(widget.pageLayoutTabId);

      if (isDefined(existing)) {
        existing.push(widget);
      } else {
        widgetsByTabId.set(widget.pageLayoutTabId, [widget]);
      }
    }

    return flatPageLayouts.map((flatPageLayout) => ({
      ...flatPageLayout,
      tabs: (tabsByPageLayoutId.get(flatPageLayout.id) ?? []).map((tab) => ({
        ...tab,
        widgets: widgetsByTabId.get(tab.id) ?? [],
      })),
    }));
  },
});
