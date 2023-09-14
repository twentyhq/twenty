import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { ColorScheme, useUpdateUserMutation } from '~/generated/graphql';

export function useColorScheme() {
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  const [updateUser] = useUpdateUserMutation();

  const colorScheme =
    !currentUser?.workspaceMember.settings?.colorScheme &&
    !currentUser?.settings?.colorScheme
      ? ColorScheme.System
      : currentUser.workspaceMember.settings?.colorScheme ??
        currentUser.settings.colorScheme;

  const setColorScheme = useCallback(
    async (value: ColorScheme) => {
      try {
        const result = await updateUser({
          variables: {
            where: {
              id: currentUser?.id,
            },
            data: {
              settings: {
                update: {
                  colorScheme: value,
                },
              },
            },
          },
          optimisticResponse:
            currentUser && currentUser.settings
              ? {
                  __typename: 'Mutation',
                  updateUser: {
                    __typename: 'User',
                    ...currentUser,
                    ...(currentUser.workspaceMember
                      ? {
                          workspaceMember: {
                            ...currentUser.workspaceMember,
                            settings: {
                              __typename: 'UserSettings',
                              id: currentUser.settings.id,
                              colorScheme: value,
                              locale: currentUser.settings.locale,
                            },
                          },
                        }
                      : {}),
                    settings: {
                      __typename: 'UserSettings',
                      id: currentUser.settings.id,
                      colorScheme: value,
                      locale: currentUser.settings.locale,
                    },
                  },
                }
              : undefined,
          update: (_cache, { data }) => {
            if (data?.updateUser && currentUser) {
              setCurrentUser({
                ...currentUser,
                settings: {
                  ...currentUser.settings,
                  colorScheme: data?.updateUser.settings.colorScheme,
                },
              });
            }
          },
        });

        if (!result.data || result.errors) {
          throw result.errors;
        }
      } catch (err) {}
    },
    [currentUser, updateUser, setCurrentUser],
  );

  return {
    colorScheme,
    setColorScheme,
  };
}
