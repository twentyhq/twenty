import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import {
  ColorScheme,
  useUpdateUserSettingsMutation,
} from '~/generated/graphql';

export const useColorScheme = () => {
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  const [updateUserSettings] = useUpdateUserSettingsMutation();

  const colorScheme = !currentUser?.workspaceMember.settings?.colorScheme
    ? ColorScheme.System
    : currentUser.workspaceMember.settings?.colorScheme;

  const setColorScheme = useCallback(
    async (value: ColorScheme) => {
      try {
        const result = await updateUserSettings({
          variables: {
            data: {
              colorScheme: value,
              // FIXME: For some reason, when I send a request with only colorScheme, it fails, weird.
              locale: currentUser?.workspaceMember.settings.locale,
            },
            where: {
              id: currentUser?.workspaceMember.settings.id,
            },
          },
          update: (_cache, { data }) => {
            if (data?.updateUserSettings.colorScheme && currentUser) {
              setCurrentUser({
                ...currentUser,
                workspaceMember: {
                  ...currentUser.workspaceMember,
                  settings: {
                    ...currentUser.workspaceMember.settings,
                    colorScheme: data.updateUserSettings.colorScheme,
                  },
                },
              });
            }
          },
          optimisticResponse: currentUser
            ? {
                __typename: 'Mutation',
                updateUserSettings: {
                  __typename: 'UserSettings',
                  id: currentUser.workspaceMember.settings.id,
                  colorScheme: value,
                  locale: currentUser.workspaceMember.settings.locale,
                },
              }
            : undefined,
        });

        if (!result.data || result.errors) {
          throw result.errors;
        }
      } catch (err) {}
    },
    [updateUserSettings, currentUser, setCurrentUser],
  );

  return {
    colorScheme,
    setColorScheme,
  };
};
