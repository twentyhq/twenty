import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatPageLayout } from '@/metadata-store/types/FlatPageLayout';
import { type FlatPageLayoutTab } from '@/metadata-store/types/FlatPageLayoutTab';
import { pageLayoutWidgetsByTabIdSelector } from '@/page-layout/states/selectors/pageLayoutWidgetsByTabIdSelector';
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
    const widgetsByTabId = get(pageLayoutWidgetsByTabIdSelector);

    const tabsByPageLayoutId = new Map<string, FlatPageLayoutTab[]>();

    for (const tab of allFlatTabs) {
      const existing = tabsByPageLayoutId.get(tab.pageLayoutId);

      if (isDefined(existing)) {
        existing.push(tab);
      } else {
        tabsByPageLayoutId.set(tab.pageLayoutId, [tab]);
      }
    }

    return flatPageLayouts.map((flatPageLayout) => ({
      ...flatPageLayout,
      tabs: (tabsByPageLayoutId.get(flatPageLayout.id) ?? []).map((tab) => ({
        ...tab,
        widgets: (widgetsByTabId.get(tab.id) ?? []).filter(
          (widget) => widget.isActive,
        ),
      })),
    }));
  },
});
