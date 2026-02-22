import { useCallback } from 'react';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { getFormatPreferencesFromWorkspaceMember } from '@/localization/utils/format-preferences/getFormatPreferencesFromWorkspaceMember';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

export const useInitializeFormatPreferences = () => {
  const setWorkspaceMemberFormatPreferences = useSetRecoilStateV2(
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
