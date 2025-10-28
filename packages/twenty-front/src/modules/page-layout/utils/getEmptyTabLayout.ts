import { type TabLayouts } from '@/page-layout/types/tab-layouts';

export const getEmptyTabLayout = (
  allTabLayouts: TabLayouts,
  tabId: string,
): TabLayouts => {
  return {
    ...allTabLayouts,
    [tabId]: { desktop: [], mobile: [] },
  };
};
