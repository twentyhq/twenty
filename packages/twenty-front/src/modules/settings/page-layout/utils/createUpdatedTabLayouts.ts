import { type TabLayouts } from '../states/pageLayoutCurrentLayoutsState';

export const createUpdatedTabLayouts = (
  allTabLayouts: TabLayouts,
  activeTabId: string,
  newLayout: { i: string; x: number; y: number; w: number; h: number },
): TabLayouts => {
  const currentTabLayouts = allTabLayouts[activeTabId] || {
    desktop: [],
    mobile: [],
  };

  return {
    ...allTabLayouts,
    [activeTabId]: {
      desktop: [...currentTabLayouts.desktop, newLayout],
      mobile: [...currentTabLayouts.mobile, { ...newLayout, w: 1, x: 0 }],
    },
  };
};
