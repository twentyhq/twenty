import { type TabLayouts } from '@/page-layout/types/tab-layouts';

export const createEmptyTabLayout = (
  allTabLayouts: TabLayouts,
  tabId: string,
): TabLayouts => {
  return {
    ...allTabLayouts,
    [tabId]: { desktop: [], mobile: [] },
  };
};
