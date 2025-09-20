import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { getFormatPreferencesFromWorkspaceMember } from '@/localization/utils/format-preferences/getFormatPreferencesFromWorkspaceMember';

export const useInitializeFormatPreferences = () => {
  const setWorkspaceMemberFormatPreferences = useSetRecoilState(
    workspaceMemberFormatPreferencesState,
  );

  const initializeFormatPreferences = useCallback(
    (workspaceMember: CurrentWorkspaceMember | null) => {
      if (!workspaceMember) return;

      const preferences =
        getFormatPreferencesFromWorkspaceMember(workspaceMember);
      setWorkspaceMemberFormatPreferences(preferences);
    },
    [setWorkspaceMemberFormatPreferences],
  );

  return {
    initializeFormatPreferences,
  };
};
