import { useEffect } from 'react';
import { isWorkspaceAccentColor } from 'twenty-shared/workspace';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { persistedWorkspaceAccentColorState } from '@/ui/theme/states/persistedWorkspaceAccentColorState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const WorkspaceAccentColorPersistEffect = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const setPersistedWorkspaceAccentColor = useSetAtomState(
    persistedWorkspaceAccentColorState,
  );

  const accentColor =
    currentWorkspace?.accentColor ?? workspacePublicData?.accentColor;

  useEffect(() => {
    if (isWorkspaceAccentColor(accentColor)) {
      setPersistedWorkspaceAccentColor(accentColor);
    }
  }, [accentColor, setPersistedWorkspaceAccentColor]);

  return null;
};
