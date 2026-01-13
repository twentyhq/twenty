import { type TabLayouts } from '@/page-layout/types/TabLayouts';
import { isDefined } from 'twenty-shared/utils';

export const removeWidgetLayoutFromTab = (
  allTabLayouts: TabLayouts,
  tabId: string,
  widgetId: string,
): TabLayouts => {
  const currentTabLayouts = allTabLayouts[tabId];

  if (!isDefined(currentTabLayouts)) {
    return allTabLayouts;
  }

  const currentDesktop = currentTabLayouts.desktop ?? [];
  const currentMobile = currentTabLayouts.mobile ?? [];

  return {
    ...allTabLayouts,
    [tabId]: {
      desktop: currentDesktop.filter((layout) => layout.i !== widgetId),
      mobile: currentMobile.filter((layout) => layout.i !== widgetId),
    },
  };
};
