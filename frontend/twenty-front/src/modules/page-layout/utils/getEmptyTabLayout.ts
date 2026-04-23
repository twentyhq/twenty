import { type TabLayouts } from '@/page-layout/types/TabLayouts';

export const getEmptyTabLayout = (
  allTabLayouts: TabLayouts,
  tabId: string,
): TabLayouts => {
  return {
    ...allTabLayouts,
    [tabId]: { desktop: [], mobile: [] },
  };
};
