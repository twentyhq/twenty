import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import {
  ColorScheme,
  useUpdateOneWorkspaceMemberMutation,
  useUpdateUserMutation,
  useUpdateUserSettingsMutation,
} from '~/generated/graphql';

export const useColorScheme = () => {
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  const [updateUser] = useUpdateUserMutation();
  const [updateWorkspaceMember] = useUpdateOneWorkspaceMemberMutation();
  const [updateUserSettings] = useUpdateUserSettingsMutation();

  // TODO: Were settings moved to `workspaceMember` exclusively?
  const colorScheme = !currentUser?.workspaceMember.settings?.colorScheme
    ? ColorScheme.System
    : currentUser.workspaceMember.settings?.colorScheme;

  const setColorScheme = useCallback(
    async (value: ColorScheme) => {
      try {
        // FIXME: Why is an error getting thrown here?
        // mutation UpdateUserSettings($data: UserSettingsUpdateInput!, $where: UserSettingsWhereUniqueInput!) {
        //  updateUserSettings(data: $data, where: $where) {
        //    id
        //    locale
        //    colorScheme
        //    __typename
        //  }
        // }
        // {
        // "errors": [
        //   {
        //     "message": "Bad Request Exception",
        //     "locations": [
        //       {
        //         "line": 2,
        //         "column": 3
        //       }
        //     ],
        //     "path": [
        //       "updateUserSettings"
        //     ]
        //   }
        // ],
        // "data": null
        // }
        await updateUserSettings({
          variables: {
            data: {
              colorScheme: value,
            },
            where: {
              id: currentUser?.workspaceMember.settings.id,
            },
          },
        });
        // connect settings to workspace member if not already connected
        await updateWorkspaceMember({
          variables: {
            where: { id: currentUser?.workspaceMember.id },
            data: {
              settings: {
                connect: { id: currentUser?.workspaceMember.settings.id },
              },
            },
          },
        });

        // const result = await updateUser({
        //   variables: {
        //     where: {
        //       id: currentUser?.id,
        //     },
        //     data: {
        //       settings: {
        //         update: {
        //           colorScheme: value,
        //         },
        //       },
        //     },
        //   },
        //   optimisticResponse: currentUser
        //     ? {
        //         __typename: 'Mutation',
        //         updateUser: {
        //           __typename: 'User',
        //           ...currentUser,
        //           workspaceMember: {
        //             ...currentUser.workspaceMember,
        //             settings: {
        //               __typename: 'UserSettings',
        //               id: currentUser.workspaceMember.settings.id,
        //               colorScheme: value,
        //               locale: currentUser.workspaceMember.settings.locale,
        //             },
        //           },
        //         },
        //       }
        //     : undefined,
        //   update: (_cache, { data }) => {
        //     if (
        //       data?.updateUser.workspaceMember?.settings?.colorScheme &&
        //       currentUser
        //     ) {
        //       setCurrentUser({
        //         ...currentUser,
        //         workspaceMember: {
        //           ...currentUser.workspaceMember,
        //           settings: {
        //             ...currentUser.workspaceMember.settings,
        //             colorScheme:
        //               data.updateUser.workspaceMember.settings.colorScheme,
        //           },
        //         },
        //       });
        //     }
        //   },
        // });

        // if (!result.data || result.errors) {
        //   throw result.errors;
        // }
      } catch (err) {}
    },
    [updateWorkspaceMember, currentUser, updateUser, setCurrentUser],
  );

  return {
    colorScheme,
    setColorScheme,
  };
};
