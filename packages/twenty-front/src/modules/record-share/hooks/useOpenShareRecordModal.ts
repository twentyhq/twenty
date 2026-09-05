import { useCallback } from 'react';

import { SHARE_RECORD_MODAL_ID } from '@/record-share/constants/ShareRecordModalId';
import { shareRecordModalTargetState } from '@/record-share/states/shareRecordModalTargetState';
import { type ShareRecordModalTarget } from '@/record-share/types/ShareRecordModalTarget';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useOpenShareRecordModal = () => {
  const setShareRecordModalTarget = useSetAtomState(
    shareRecordModalTargetState,
  );
  const { openModal } = useModal();

  const openShareRecordModal = useCallback(
    (target: ShareRecordModalTarget) => {
      setShareRecordModalTarget(target);
      openModal(SHARE_RECORD_MODAL_ID);
    },
    [setShareRecordModalTarget, openModal],
  );

  return { openShareRecordModal };
};
