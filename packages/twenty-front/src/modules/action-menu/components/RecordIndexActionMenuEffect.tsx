import { useActionMenu } from '@/action-menu/hooks/useActionMenu';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getActionBarIdFromActionMenuId } from '@/action-menu/utils/getActionBarIdFromActionMenuId';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { isBottomBarOpenedComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenedComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

export const RecordIndexActionMenuEffect = () => {
  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { openActionBar, closeActionBar } = useActionMenu(actionMenuId);

  // Using closeActionBar here was causing a bug because it goes back to the
  // previous hotkey scope, and we don't want that here.
  const setIsBottomBarOpened = useSetRecoilComponentStateV2(
    isBottomBarOpenedComponentState,
    getActionBarIdFromActionMenuId(actionMenuId),
  );

  const isDropdownOpen = useRecoilValue(
    extractComponentState(
      isDropdownOpenComponentState,
      getActionMenuDropdownIdFromActionMenuId(actionMenuId),
    ),
  );
  const { isRightDrawerOpen } = useRightDrawer();

  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  useEffect(() => {
    if (
      contextStoreNumberOfSelectedRecords > 0 &&
      !isDropdownOpen &&
      !isRightDrawerOpen &&
      !isCommandMenuOpened
    ) {
      // We only handle opening the ActionMenuBar here, not the Dropdown.
      // The Dropdown is already managed by sync handlers for events like
      // right-click to open and click outside to close.
      openActionBar();
    }
    if (contextStoreNumberOfSelectedRecords === 0 && isDropdownOpen) {
      closeActionBar();
    }
  }, [
    contextStoreNumberOfSelectedRecords,
    openActionBar,
    closeActionBar,
    isDropdownOpen,
    isRightDrawerOpen,
    isCommandMenuOpened,
  ]);

  useEffect(() => {
    if (isRightDrawerOpen || isCommandMenuOpened) {
      setIsBottomBarOpened(false);
    }
  }, [isRightDrawerOpen, isCommandMenuOpened, setIsBottomBarOpened]);

  return null;
};
