import { isDefined } from 'twenty-shared/utils';
import { type TabLayouts } from '@/page-layout/types/TabLayouts';

export const removeTabLayouts = (
  allTabLayouts: TabLayouts,
  tabId: string,
): TabLayouts => {
  if (!isDefined(allTabLayouts[tabId])) {
    return allTabLayouts;
  }

  const { [tabId]: _removed, ...rest } = allTabLayouts;
  return rest;
};
