import { useActionMenu } from '@/action-menu/hooks/useActionMenu';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

type ActionMenuEffectProps = {
  actionMenuId: string;
};

export const ActionMenuEffect = ({ actionMenuId }: ActionMenuEffectProps) => {
  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  const { openActionBar, closeActionMenu } = useActionMenu(actionMenuId);

  useEffect(() => {
    if (contextStoreTargetedRecordIds.length > 0) {
      openActionBar();
    } else {
      closeActionMenu();
    }
  }, [contextStoreTargetedRecordIds, openActionBar, closeActionMenu]);

  return null;
};
