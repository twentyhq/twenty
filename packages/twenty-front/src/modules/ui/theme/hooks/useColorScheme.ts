import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';

export const useColorScheme = () => {
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const { updateOneRecord: updateOneWorkspaceMember } = useUpdateOneRecord({
    objectNameSingular: 'workspaceMember',
  });

  const colorScheme = currentWorkspaceMember?.colorScheme ?? 'System';

  const setColorScheme = useCallback(
    async (value: ColorScheme) => {
      if (!currentWorkspaceMember) {
        return;
      }
      setCurrentWorkspaceMember((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          colorScheme: value,
        };
      });
      await updateOneWorkspaceMember?.({
        idToUpdate: currentWorkspaceMember?.id,
        input: {
          colorScheme: value,
        },
      });
    },
    [
      currentWorkspaceMember,
      setCurrentWorkspaceMember,
      updateOneWorkspaceMember,
    ],
  );

  return {
    colorScheme,
    setColorScheme,
  };
};
