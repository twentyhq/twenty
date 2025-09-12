import { type TabLayouts } from '../states/pageLayoutCurrentLayoutsComponentState';

export const createEmptyTabLayout = (
  allTabLayouts: TabLayouts,
  tabId: string,
): TabLayouts => {
  return {
    ...allTabLayouts,
    [tabId]: { desktop: [], mobile: [] },
  };
};
