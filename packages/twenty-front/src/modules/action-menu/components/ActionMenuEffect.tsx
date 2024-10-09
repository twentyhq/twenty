import { useActionMenu } from '@/action-menu/hooks/useActionMenu';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

export const ActionMenuEffect = () => {
  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { openActionBar, closeActionBar } = useActionMenu(actionMenuId);

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
