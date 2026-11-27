import { useLingui } from '@lingui/react/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  WORKSPACE_UI_SCALES,
  type WorkspaceUiScale,
} from 'twenty-shared/workspace';
import { type SelectOption } from 'twenty-ui/primitives/input';

import { UI_SCALE_ICONS } from '@/ui/theme/constants/UiScaleIcons';
import { UI_SCALE_MULTIPLIERS } from '@/ui/theme/constants/UiScaleMultipliers';
import { type UiScale } from '@/ui/theme/types/UiScale';

export const useUiScaleSelectOptions = (workspaceUiScale: WorkspaceUiScale) => {
  const { t } = useLingui();

  const labels: Record<UiScale, string> = {
    Default: t`Workspace default`,
    Smaller: t`Smaller`,
    Normal: t`Normal`,
    Large: t`Large`,
    Larger: t`Larger`,
  };

  const toOption = <TValue extends UiScale>({
    uiScale,
    displayedUiScale,
  }: {
    uiScale: TValue;
    displayedUiScale: WorkspaceUiScale;
  }): SelectOption<TValue> => ({
    label: labels[uiScale],
    value: uiScale,
    Icon: UI_SCALE_ICONS[uiScale],
    contextualText: `${Math.round(UI_SCALE_MULTIPLIERS[displayedUiScale] * 100)}%`,
  });

  return {
    scaleOptions: WORKSPACE_UI_SCALES.map((uiScale) =>
      toOption({ uiScale, displayedUiScale: uiScale }),
    ),
    workspaceDefaultOption: toOption({
      uiScale: doNotTranslate('Default'),
      displayedUiScale: workspaceUiScale,
    }),
  };
};
