import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isDefined } from 'twenty-shared/utils';

export const resolveWidgetTypeSelectTargetTabId = ({
  pageLayoutEditingWidgetId,
  tabs,
  widgetCreationTargetTabId,
}: {
  pageLayoutEditingWidgetId: string | null;
  tabs: PageLayoutTab[];
  widgetCreationTargetTabId: string | null;
}): string => {
  if (isDefined(pageLayoutEditingWidgetId)) {
    const editingWidgetTab = tabs.find((tab) =>
      tab.widgets.some((widget) => widget.id === pageLayoutEditingWidgetId),
    );

    if (!isDefined(editingWidgetTab)) {
      throw new Error(
        // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
        `Cannot find tab containing editing widget ${pageLayoutEditingWidgetId}`,
      );
    }

    return editingWidgetTab.id;
  }

  if (!isDefined(widgetCreationTargetTabId)) {
    throw new Error(
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
      'widgetCreationTargetTabId must be set when navigating to widget type select without an editing widget',
    );
  }

  return widgetCreationTargetTabId;
};
