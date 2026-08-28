import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconMoon,
  IconSun,
  IconSunMoon,
} from 'twenty-ui/icon';

export const useColorScheme = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();
  const setPersistedColorScheme = useSetAtomState(persistedColorSchemeState);
  const { enqueueErrorSnackBar } = useSnackBar();

  const colorScheme = currentWorkspaceMember?.colorScheme ?? 'System';

  const setColorScheme = useCallback(
    async (value: ColorScheme) => {
      if (!isDefined(currentWorkspaceMember)) {
        return;
      }

      try {
        await updateWorkspaceMemberSettings({
          workspaceMemberId: currentWorkspaceMember.id,
          update: {
            colorScheme: value,
          },
        });
        setPersistedColorScheme(value);
      } catch {
        enqueueErrorSnackBar({ message: t`Failed to update theme` });
      }
    },
    [
      currentWorkspaceMember,
      setPersistedColorScheme,
      updateWorkspaceMemberSettings,
      enqueueErrorSnackBar,
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
