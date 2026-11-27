import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  DEFAULT_WORKSPACE_UI_SCALE,
  isWorkspaceUiScale,
  type WorkspaceUiScale,
} from 'twenty-shared/workspace';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Select } from '@/ui/input/components/Select';
import { useUiScaleSelectOptions } from '@/ui/theme/hooks/useUiScaleSelectOptions';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const WorkspaceUiScaleSelect = () => {
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const uiScale = isWorkspaceUiScale(currentWorkspace?.uiScale)
    ? currentWorkspace.uiScale
    : DEFAULT_WORKSPACE_UI_SCALE;

  const { scaleOptions } = useUiScaleSelectOptions(uiScale);

  const setUiScale = (scale: WorkspaceUiScale) =>
    setCurrentWorkspace((currentValue) =>
      isDefined(currentValue)
        ? { ...currentValue, uiScale: scale }
        : currentValue,
    );

  const handleChange = async (scale: WorkspaceUiScale) => {
    if (scale === uiScale) {
      return;
    }

    const previousUiScale = uiScale;

    setUiScale(scale);

    try {
      const result = await updateWorkspace({
        variables: { input: { uiScale: scale } },
      });

      if (isDefined(result.error)) {
        throw result.error;
      }
    } catch (error) {
      setUiScale(previousUiScale);
      logError(error);
    }
  };

  return (
    <Select<WorkspaceUiScale>
      dropdownId="workspace-ui-scale-select"
      dropdownWidth={218}
      dropdownWidthAuto
      fullWidth
      needIconCheck
      selectSizeVariant="small"
      value={uiScale}
      options={scaleOptions}
      onChange={(scale) => void handleChange(scale)}
    />
  );
};
