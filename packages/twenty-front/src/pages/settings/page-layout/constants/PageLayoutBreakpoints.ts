import { MOBILE_VIEWPORT } from 'twenty-ui';

export const PAGE_LAYOUT_CONFIG = {
  breakpoints: {
    desktop: MOBILE_VIEWPORT, // Use the standard mobile viewport (768px) as the breakpoint
    mobile: 0,
  },
  columns: {
    desktop: 12,
    mobile: 1,
  },
} as const;

export type PageLayoutBreakpoint = 'desktop' | 'mobile';
