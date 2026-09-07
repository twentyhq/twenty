import { isDefined } from 'twenty-shared/utils';
import { type TabLayouts } from '@/page-layout/types/TabLayouts';

export const removeWidgetLayoutFromTab = (
  allTabLayouts: TabLayouts,
  tabId: string,
  widgetId: string,
): TabLayouts => {
  const currentTabLayouts = allTabLayouts[tabId];

  if (!isDefined(currentTabLayouts)) {
    return allTabLayouts;
  }

  return {
    ...allTabLayouts,
    [tabId]: {
      desktop: (currentTabLayouts.desktop ?? []).filter(
        (layout) => layout.i !== widgetId,
      ),
      mobile: (currentTabLayouts.mobile ?? []).filter(
        (layout) => layout.i !== widgetId,
      ),
    },
  };
};
