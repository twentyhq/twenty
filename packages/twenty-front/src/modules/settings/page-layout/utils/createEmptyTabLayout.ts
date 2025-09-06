import { type TabLayouts } from '../states/pageLayoutCurrentLayoutsState';

export const createEmptyTabLayout = (
  allTabLayouts: TabLayouts,
  tabId: string,
): TabLayouts => {
  return {
    ...allTabLayouts,
    [tabId]: { desktop: [], mobile: [] },
  };
};
