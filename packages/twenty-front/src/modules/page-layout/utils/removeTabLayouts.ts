import { type TabLayouts } from '@/page-layout/types/tab-layouts';

export const removeTabLayouts = (
  allTabLayouts: TabLayouts,
  tabId: string,
): TabLayouts => {
  if (!allTabLayouts[tabId]) {
    return allTabLayouts;
  }

  const { [tabId]: _removed, ...rest } = allTabLayouts;
  return rest;
};
