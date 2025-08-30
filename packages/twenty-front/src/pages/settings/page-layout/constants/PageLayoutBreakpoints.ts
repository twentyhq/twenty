import { NAV_DRAWER_WIDTHS } from '@/ui/navigation/navigation-drawer/constants/NavDrawerWidths';

export const PAGE_LAYOUT_CONFIG = {
  breakpoints: {
    desktop: NAV_DRAWER_WIDTHS.menu.desktop.expanded + 500, // 220 + 500 = 720px need confirmation from product side
    mobile: 0,
  },
  columns: {
    desktop: 12,
    mobile: 1,
  },
} as const;

export type PageLayoutBreakpoint = 'desktop' | 'mobile';
