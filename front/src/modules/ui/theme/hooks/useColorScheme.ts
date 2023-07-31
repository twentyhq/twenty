import { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { ColorScheme, useUpdateUserMutation } from '~/generated/graphql';

export function useColorScheme() {
  const [currentUser] = useRecoilState(currentUserState);

  const [updateUser] = useUpdateUserMutation();

  const colorScheme = useMemo(() => {
    if (!currentUser?.settings?.colorScheme) {
      // Use system color scheme if user is not logged in or has no settings
      return ColorScheme.System;
    }

    return currentUser.settings.colorScheme;
  }, [currentUser?.settings?.colorScheme]);

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
                    settings: {
                      __typename: 'UserSettings',
                      id: currentUser.settings.id,
                      colorScheme: value,
                      locale: currentUser.settings.locale,
                    },
                  },
                }
              : undefined,
        });

        if (!result.data || result.errors) {
          throw result.errors;
        }
      } catch (err) {}
    },
    [currentUser, updateUser],
  );

  return {
    colorScheme,
    setColorScheme,
  };
}
