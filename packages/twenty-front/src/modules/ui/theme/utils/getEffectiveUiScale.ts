import { isWorkspaceUiScale } from 'twenty-shared/workspace';

import { type UiScale } from '@/ui/theme/types/UiScale';

export const getEffectiveUiScale = (
  memberUiScale: UiScale,
  workspaceUiScale: string | null | undefined,
): UiScale =>
  memberUiScale === 'Default' && isWorkspaceUiScale(workspaceUiScale)
    ? workspaceUiScale
    : memberUiScale;
