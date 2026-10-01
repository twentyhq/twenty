import { type UiScale } from '@/workspace-member/types/WorkspaceMember';

// Steps bracket the range where layout survives, as breakpoints do not move with the scale (unlike browser zoom)
export const UI_SCALE_MULTIPLIERS: Record<UiScale, number> = {
  Smaller: 0.9,
  Default: 1,
  Large: 1.1,
  Larger: 1.25,
};
