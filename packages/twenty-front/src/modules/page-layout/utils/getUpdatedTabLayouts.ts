import { type TabLayouts } from '@/page-layout/types/TabLayouts';
import { isDefined } from 'twenty-shared/utils';

export const getUpdatedTabLayouts = (
  allTabLayouts: TabLayouts,
  activeTabId: string,
  newLayout: { i: string; x: number; y: number; w: number; h: number },
): TabLayouts => {
  const existingTabLayouts = allTabLayouts[activeTabId];
  const currentDesktop = existingTabLayouts?.desktop ?? [];
  const currentMobile = existingTabLayouts?.mobile ?? [];

  if (
    isDefined(existingTabLayouts) &&
    (!isDefined(existingTabLayouts.desktop) ||
      !isDefined(existingTabLayouts.mobile))
  ) {
    throw new Error(
      `Tab layouts for ${activeTabId} are malformed: missing desktop or mobile layouts`,
    );
  }

  return {
    ...allTabLayouts,
    [activeTabId]: {
      desktop: [...currentDesktop, newLayout],
      mobile: [...currentMobile, { ...newLayout, w: 1, x: 0 }],
    },
  };
};
