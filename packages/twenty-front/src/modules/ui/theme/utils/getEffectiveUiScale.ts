import { isWorkspaceUiScale } from 'twenty-shared/workspace';

import { type UiScale } from '@/ui/theme/types/UiScale';

type GetEffectiveUiScaleArgs = {
  memberUiScale: UiScale;
  workspaceUiScale: string | null | undefined;
};

export const getEffectiveUiScale = ({
  memberUiScale,
  workspaceUiScale,
}: GetEffectiveUiScaleArgs): UiScale =>
  memberUiScale === 'Default' && isWorkspaceUiScale(workspaceUiScale)
    ? workspaceUiScale
    : memberUiScale;
