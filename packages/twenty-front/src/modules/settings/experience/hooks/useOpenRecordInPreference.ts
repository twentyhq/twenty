import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { DEFAULT_OPEN_RECORD_IN_PREFERENCE } from '@/object-record/record-index/constants/DefaultOpenRecordInPreference';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useCallback } from 'react';
import { type ResolvedOpenRecordIn } from 'twenty-shared/types';

export const useOpenRecordInPreference = () => {
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useAtomState(
    currentWorkspaceMemberState,
  );

  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();

  const openRecordInPreference =
    currentWorkspaceMember?.openRecordIn ?? DEFAULT_OPEN_RECORD_IN_PREFERENCE;

  const setOpenRecordInPreference = useCallback(
    async (value: ResolvedOpenRecordIn) => {
      if (!currentWorkspaceMember) {
        return;
      }

      setCurrentWorkspaceMember((current) =>
        current ? { ...current, openRecordIn: value } : current,
      );

      await updateWorkspaceMemberSettings({
        workspaceMemberId: currentWorkspaceMember.id,
        update: {
          openRecordIn: value,
        },
      });
    },
    [
      currentWorkspaceMember,
      setCurrentWorkspaceMember,
      updateWorkspaceMemberSettings,
    ],
  );

  return {
    openRecordInPreference,
    setOpenRecordInPreference,
  };
};
