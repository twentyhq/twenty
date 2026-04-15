import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useCallback } from 'react';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import {
  type IconComponent,
  IconMoon,
  IconSun,
  IconSunMoon,
} from 'twenty-ui/display';

export const useColorScheme = () => {
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useAtomState(
    currentWorkspaceMemberState,
  );

  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();
  const setPersistedColorScheme = useSetAtomState(persistedColorSchemeState);

  const colorScheme = currentWorkspaceMember?.colorScheme ?? 'System';

  const setColorScheme = useCallback(
    async (value: ColorScheme) => {
      if (!currentWorkspaceMember) {
        return;
      }
      setPersistedColorScheme(value);
      setCurrentWorkspaceMember((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          colorScheme: value,
        };
      });
      await updateWorkspaceMemberSettings({
        workspaceMemberId: currentWorkspaceMember.id,
        update: {
          colorScheme: value,
        },
      });
    },
    [
      currentWorkspaceMember,
      setCurrentWorkspaceMember,
      setPersistedColorScheme,
      updateWorkspaceMemberSettings,
    ],
  );

  const colorSchemeList: Array<{
    id: ColorScheme;
    icon: IconComponent;
  }> = [
    {
      id: 'System',
      icon: IconSunMoon,
    },
    {
      id: 'Dark',
      icon: IconMoon,
    },
    {
      id: 'Light',
      icon: IconSun,
    },
  ];

  return {
    colorScheme,
    setColorScheme,
    colorSchemeList,
  };
};
