import { type UiScale } from '@/workspace-member/types/WorkspaceMember';

// Multiplies --t-scale-user, which every dimension token in the theme derives
// from. Default is exactly today's rendering; the steps bracket the range
// where layout survives without reflowing (breakpoints do not move with the
// scale, unlike browser zoom).
export const UI_SCALE_MULTIPLIERS: Record<UiScale, number> = {
  Smaller: 0.9,
  Default: 1,
  Large: 1.1,
  Larger: 1.25,
};
