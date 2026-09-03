import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { isErrorLike } from '@apollo/client/errors';
import { useStore } from 'jotai';
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
  const store = useStore();

  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();
  const { enqueueErrorSnackBar } = useSnackBar();

  const colorScheme = currentWorkspaceMember?.colorScheme ?? 'System';

  const setColorScheme = useCallback(
    async (value: ColorScheme) => {
      const workspaceMember = store.get(currentWorkspaceMemberState.atom);

      if (!isDefined(workspaceMember)) {
        return;
      }

      const previousPersistedColorScheme = store.get(
        persistedColorSchemeState.atom,
      );

      store.set(currentWorkspaceMemberState.atom, {
        ...workspaceMember,
        colorScheme: value,
      });
      store.set(persistedColorSchemeState.atom, value);

      try {
        await updateWorkspaceMemberSettings({
          workspaceMemberId: workspaceMember.id,
          update: {
            colorScheme: value,
          },
        });
      } catch (error) {
        const latestWorkspaceMember = store.get(
          currentWorkspaceMemberState.atom,
        );

        if (
          latestWorkspaceMember?.id === workspaceMember.id &&
          latestWorkspaceMember.colorScheme === value
        ) {
          store.set(currentWorkspaceMemberState.atom, {
            ...latestWorkspaceMember,
            colorScheme: workspaceMember.colorScheme,
          });
          store.set(
            persistedColorSchemeState.atom,
            previousPersistedColorScheme,
          );
        }

        enqueueErrorSnackBar(isErrorLike(error) ? { apolloError: error } : {});
      }
    },
    [store, updateWorkspaceMemberSettings, enqueueErrorSnackBar],
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
