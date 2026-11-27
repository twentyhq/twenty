import {
  DEFAULT_WORKSPACE_ACCENT_COLOR,
  WORKSPACE_ACCENT_COLORS,
  isWorkspaceAccentColor,
  type WorkspaceAccentColor,
} from 'twenty-shared/workspace';
import { ColorSample } from 'twenty-ui/primitives/data-display';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SETTINGS_SELECT_DROPDOWN_WIDTH } from '@/settings/constants/SettingsSelectDropdownWidth';
import { useOptimisticWorkspaceUpdate } from '@/settings/workspace/hooks/useOptimisticWorkspaceUpdate';
import { Select } from '@/ui/input/components/Select';
import { useColorLabels } from '@/ui/input/hooks/useColorLabels';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const WorkspaceAccentColorSelect = () => {
  const colorLabels = useColorLabels();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { updateWorkspaceOptimistically } = useOptimisticWorkspaceUpdate();

  const accentColor = isWorkspaceAccentColor(currentWorkspace?.accentColor)
    ? currentWorkspace.accentColor
    : DEFAULT_WORKSPACE_ACCENT_COLOR;

  const options = WORKSPACE_ACCENT_COLORS.map((color) => ({
    value: color,
    label: colorLabels[color],
    LeftComponent: <ColorSample colorName={color} />,
  }));

  const handleChange = (color: WorkspaceAccentColor) => {
    if (color === accentColor) {
      return;
    }

    void updateWorkspaceOptimistically({
      update: { accentColor: color },
      rollback: { accentColor },
    });
  };

  return (
    <Select<WorkspaceAccentColor>
      dropdownId="workspace-accent-color-select"
      dropdownWidth={SETTINGS_SELECT_DROPDOWN_WIDTH}
      dropdownWidthAuto
      fullWidth
      needIconCheck
      selectSizeVariant="small"
      value={accentColor}
      options={options}
      onChange={handleChange}
    />
  );
};
