import { type TabLayouts } from '../states/pageLayoutCurrentLayoutsState';

export const removeWidgetLayoutFromTab = (
  allTabLayouts: TabLayouts,
  tabId: string,
  widgetId: string,
): TabLayouts => {
  if (!allTabLayouts[tabId]) {
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
