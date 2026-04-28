import { type ThemeColor } from 'twenty-ui/theme';

// Default mapping of `blockedBy` SELECT values (as defined on
// OpportunityMilestone) to theme tag colors. The lock badge that paints
// over a bar reads these tokens via `themeCssVariables.tag.background.*`.
// `NONE` returns null to signal "no badge". Custom workspaces that rename
// their `blockedBy` options will fall through to the neutral fallback.
export const ROADMAP_BLOCKED_BY_COLOR_MAP: Record<string, ThemeColor | null> = {
  NONE: null,
  CLIENT: 'orange',
  INTERNAL: 'red',
  EXTERNAL_VENDOR: 'purple',
};

export const getRoadmapBlockedByColor = (
  blockedBy: string | null | undefined,
): ThemeColor | null => {
  if (blockedBy === null || blockedBy === undefined) return null;
  return ROADMAP_BLOCKED_BY_COLOR_MAP[blockedBy] ?? null;
};
