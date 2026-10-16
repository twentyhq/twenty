import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

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
        doNotTranslate(
          `Cannot find tab containing editing widget ${pageLayoutEditingWidgetId}`,
        ),
      );
    }

    return editingWidgetTab.id;
  }

  if (!isDefined(widgetCreationTargetTabId)) {
    throw new Error(
      doNotTranslate(
        'widgetCreationTargetTabId must be set when navigating to widget type select without an editing widget',
      ),
    );
  }

  return widgetCreationTargetTabId;
};
