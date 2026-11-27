import { isWorkspaceUiScale } from 'twenty-shared/workspace';

import { type UiScale } from '@/ui/theme/types/UiScale';
import { type UiScaleStep } from '@/ui/theme/types/UiScaleStep';

type GetEffectiveUiScaleArgs = {
  memberUiScale: UiScale;
  workspaceUiScale: string | null | undefined;
};

export const getEffectiveUiScale = ({
  memberUiScale,
  workspaceUiScale,
}: GetEffectiveUiScaleArgs): UiScaleStep =>
  memberUiScale === 'Default' && isWorkspaceUiScale(workspaceUiScale)
    ? workspaceUiScale
    : memberUiScale;
