import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

export const UserThemeProviderEffect = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const setPersistedColorScheme = useSetAtomState(persistedColorSchemeState);

  useEffect(() => {
    const colorScheme = currentWorkspaceMember?.colorScheme ?? 'System';
    setPersistedColorScheme(colorScheme);
  }, [currentWorkspaceMember?.colorScheme, setPersistedColorScheme]);

  return null;
};
