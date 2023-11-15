import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { ColorScheme } from '~/generated/graphql';

export const useColorScheme = () => {
  const [currentWorkspaceMember] = useRecoilState(currentWorkspaceMemberState);

  const { updateOneObject: updateOneWorkspaceMember } =
    useUpdateOneObjectRecord({
      objectNamePlural: 'workspaceMembersV2',
    });
  const colorScheme = currentWorkspaceMember?.colorScheme ?? ColorScheme.System;

  const setColorScheme = useCallback(
    async (value: ColorScheme) => {
      if (!currentWorkspaceMember) {
        return;
      }
      await updateOneWorkspaceMember?.({
        idToUpdate: currentWorkspaceMember?.id,
        input: {
          colorScheme: value,
        },
      });
    },
    [currentWorkspaceMember, updateOneWorkspaceMember],
  );

  return {
    colorScheme,
    setColorScheme,
  };
};
