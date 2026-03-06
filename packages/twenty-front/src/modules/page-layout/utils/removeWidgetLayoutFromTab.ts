import { isDefined } from 'twenty-shared/utils';
import { type TabLayouts } from '@/page-layout/types/TabLayouts';

export const removeWidgetLayoutFromTab = (
  allTabLayouts: TabLayouts,
  tabId: string,
  widgetId: string,
): TabLayouts => {
  if (!isDefined(allTabLayouts[tabId])) {
    return allTabLayouts;
  }

  const currentTabLayouts = allTabLayouts[tabId];
  return {
    ...allTabLayouts,
    [tabId]: {
      desktop: currentTabLayouts.desktop.filter(
        (layout) => layout.i !== widgetId,
      ),
      mobile: currentTabLayouts.mobile.filter(
        (layout) => layout.i !== widgetId,
      ),
    },
  };
};
