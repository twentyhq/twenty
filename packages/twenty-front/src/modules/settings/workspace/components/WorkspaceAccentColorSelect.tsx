import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  DEFAULT_WORKSPACE_ACCENT_COLOR,
  WORKSPACE_ACCENT_COLORS,
  isWorkspaceAccentColor,
  type WorkspaceAccentColor,
} from 'twenty-shared/workspace';
import { ColorSample } from 'twenty-ui/primitives/data-display';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Select } from '@/ui/input/components/Select';
import { useColorLabels } from '@/ui/input/hooks/useColorLabels';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const WorkspaceAccentColorSelect = () => {
  const colorLabels = useColorLabels();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const accentColor = isWorkspaceAccentColor(currentWorkspace?.accentColor)
    ? currentWorkspace.accentColor
    : DEFAULT_WORKSPACE_ACCENT_COLOR;

  const options = WORKSPACE_ACCENT_COLORS.map((color) => ({
    value: color,
    label: colorLabels[color],
    LeftComponent: <ColorSample colorName={color} />,
  }));

  const setAccentColor = (color: WorkspaceAccentColor) =>
    setCurrentWorkspace((currentValue) =>
      isDefined(currentValue)
        ? { ...currentValue, accentColor: color }
        : currentValue,
    );

  const handleChange = async (color: WorkspaceAccentColor) => {
    if (color === accentColor) {
      return;
    }

    const previousAccentColor = accentColor;

    setAccentColor(color);

    try {
      const result = await updateWorkspace({
        variables: { input: { accentColor: color } },
      });

      if (isDefined(result.error)) {
        throw result.error;
      }
    } catch (error) {
      setAccentColor(previousAccentColor);
      logError(error);
    }
  };

  return (
    <Select<WorkspaceAccentColor>
      dropdownId="workspace-accent-color-select"
      dropdownWidth={218}
      dropdownWidthAuto
      fullWidth
      needIconCheck
      selectSizeVariant="small"
      value={accentColor}
      options={options}
      onChange={(color) => void handleChange(color)}
    />
  );
};
