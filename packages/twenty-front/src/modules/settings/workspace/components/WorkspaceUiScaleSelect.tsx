import {
  DEFAULT_WORKSPACE_UI_SCALE,
  isWorkspaceUiScale,
  type WorkspaceUiScale,
} from 'twenty-shared/workspace';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SETTINGS_SELECT_DROPDOWN_WIDTH } from '@/settings/constants/SettingsSelectDropdownWidth';
import { useUiScaleSelectOptions } from '@/settings/hooks/useUiScaleSelectOptions';
import { useOptimisticWorkspaceUpdate } from '@/settings/workspace/hooks/useOptimisticWorkspaceUpdate';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const WorkspaceUiScaleSelect = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { updateWorkspaceOptimistically } = useOptimisticWorkspaceUpdate();

  const uiScale = isWorkspaceUiScale(currentWorkspace?.uiScale)
    ? currentWorkspace.uiScale
    : DEFAULT_WORKSPACE_UI_SCALE;

  const { workspaceScaleOptions } = useUiScaleSelectOptions(uiScale);

  const handleChange = (scale: WorkspaceUiScale) => {
    if (scale === uiScale) {
      return;
    }

    void updateWorkspaceOptimistically({
      update: { uiScale: scale },
      rollback: { uiScale },
    });
  };

  return (
    <Select<WorkspaceUiScale>
      dropdownId="workspace-ui-scale-select"
      dropdownWidth={SETTINGS_SELECT_DROPDOWN_WIDTH}
      dropdownWidthAuto
      fullWidth
      needIconCheck
      selectSizeVariant="small"
      value={uiScale}
      options={workspaceScaleOptions}
      onChange={handleChange}
    />
  );
};
