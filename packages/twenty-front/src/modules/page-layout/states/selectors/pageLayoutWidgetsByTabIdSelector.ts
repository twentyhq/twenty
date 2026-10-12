import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';

export const pageLayoutWidgetsByTabIdSelector = createAtomSelector<
  Map<string, FlatPageLayoutWidget[]>
>({
  key: 'pageLayoutWidgetsByTabIdSelector',
  get: ({ get }) => {
    const allFlatWidgets = get(metadataStoreState, 'pageLayoutWidgets')
      .current as FlatPageLayoutWidget[];

    const widgetsByTabId = new Map<string, FlatPageLayoutWidget[]>();

    for (const widget of allFlatWidgets) {
      const existing = widgetsByTabId.get(widget.pageLayoutTabId);

      if (isDefined(existing)) {
        existing.push(widget);
      } else {
        widgetsByTabId.set(widget.pageLayoutTabId, [widget]);
      }
    }

    return widgetsByTabId;
  },
});
