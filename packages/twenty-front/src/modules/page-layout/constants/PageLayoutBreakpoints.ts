import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

export const PAGE_LAYOUT_CONFIG = {
  breakpoints: {
    desktop: MOBILE_VIEWPORT,
    mobile: 0,
  },
  columns: {
    desktop: 12,
    mobile: 1,
  },
} as const;

export type PageLayoutBreakpoint = 'desktop' | 'mobile';
