import { useLingui } from '@lingui/react/macro';
import { UI_SCALE_VALUES } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  WORKSPACE_UI_SCALES,
  type WorkspaceUiScale,
} from 'twenty-shared/workspace';
import { type SelectOption } from 'twenty-ui/primitives/input';

import { UI_SCALE_ICONS } from '@/ui/theme/constants/UiScaleIcons';
import { UI_SCALE_MULTIPLIERS } from '@/ui/theme/constants/UiScaleMultipliers';
import { type UiScale } from '@/ui/theme/types/UiScale';
import { type UiScaleStep } from '@/ui/theme/types/UiScaleStep';

const MEMBER_UI_SCALES = UI_SCALE_VALUES.filter(
  (uiScale): uiScale is Exclude<UiScale, 'Default'> => uiScale !== 'Default',
);

export const useUiScaleSelectOptions = (workspaceUiScale: WorkspaceUiScale) => {
  const { t } = useLingui();

  const labels: Record<UiScaleStep, string> = {
    Default: t`Workspace default`,
    Smaller: t`Smaller`,
    Normal: t`Normal`,
    Large: t`Large`,
    Larger: t`Larger`,
  };

  const toOption = <TValue extends UiScaleStep>({
    uiScale,
    displayedUiScale,
  }: {
    uiScale: TValue;
    displayedUiScale: UiScaleStep;
  }): SelectOption<TValue> => ({
    label: labels[uiScale],
    value: uiScale,
    Icon: UI_SCALE_ICONS[uiScale],
    contextualText: `${Math.round(UI_SCALE_MULTIPLIERS[displayedUiScale] * 100)}%`,
  });

  return {
    workspaceScaleOptions: WORKSPACE_UI_SCALES.map((uiScale) =>
      toOption({ uiScale, displayedUiScale: uiScale }),
    ),
    memberScaleOptions: MEMBER_UI_SCALES.map((uiScale) =>
      toOption({ uiScale, displayedUiScale: uiScale }),
    ),
    workspaceDefaultOption: toOption({
      uiScale: doNotTranslate('Default'),
      displayedUiScale: workspaceUiScale,
    }),
  };
};
