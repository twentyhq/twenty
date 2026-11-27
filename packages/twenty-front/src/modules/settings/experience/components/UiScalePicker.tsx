import {
  DEFAULT_WORKSPACE_UI_SCALE,
  isWorkspaceUiScale,
} from 'twenty-shared/workspace';

import { SETTINGS_SELECT_DROPDOWN_WIDTH } from '@/settings/constants/SettingsSelectDropdownWidth';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Select } from '@/ui/input/components/Select';
import { useUiScaleSelectOptions } from '@/settings/hooks/useUiScaleSelectOptions';
import { type UiScale } from '@/ui/theme/types/UiScale';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useUiScale } from '@/workspace-member/hooks/useUiScale';

export const UiScalePicker = () => {
  const { uiScaleStep, setUiScaleStep } = useUiScale();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { scaleOptions, workspaceDefaultOption } = useUiScaleSelectOptions(
    isWorkspaceUiScale(currentWorkspace?.uiScale)
      ? currentWorkspace.uiScale
      : DEFAULT_WORKSPACE_UI_SCALE,
  );

  const handleChange = (step: UiScale) => {
    void setUiScaleStep(step);
  };

  return (
    <Select<UiScale>
      dropdownId="ui-scale-picker"
      dropdownWidth={SETTINGS_SELECT_DROPDOWN_WIDTH}
      dropdownWidthAuto
      fullWidth
      needIconCheck
      selectSizeVariant="small"
      value={uiScaleStep}
      pinnedOption={workspaceDefaultOption}
      options={scaleOptions}
      onChange={handleChange}
    />
  );
};
