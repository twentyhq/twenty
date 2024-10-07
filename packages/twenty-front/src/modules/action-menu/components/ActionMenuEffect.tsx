import { useActionMenu } from '@/action-menu/hooks/useActionMenu';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

type ActionMenuEffectProps = {
  actionMenuId: string;
};

export const ActionMenuEffect = ({ actionMenuId }: ActionMenuEffectProps) => {
  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  const { openActionBar, closeActionMenuDropdown, closeActionBar } =
    useActionMenu(actionMenuId);

  const isDropdownOpen = useRecoilValue(
    extractComponentState(
      isDropdownOpenComponentState,
      `action-menu-dropdown-${actionMenuId}`,
    ),
  );

  useEffect(() => {
    if (contextStoreTargetedRecordIds.length > 0 && !isDropdownOpen) {
      openActionBar();
    }
    if (contextStoreTargetedRecordIds.length === 0) {
      closeActionBar();
    }
  }, [
    contextStoreTargetedRecordIds,
    openActionBar,
    closeActionBar,
    isDropdownOpen,
  ]);

  return null;
};
