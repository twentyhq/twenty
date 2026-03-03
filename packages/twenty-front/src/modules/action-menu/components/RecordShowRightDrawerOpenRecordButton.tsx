import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { t } from '@lingui/core/macro';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconBrowserMaximize } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type RecordShowRightDrawerOpenRecordButtonProps = {
  objectNameSingular: string;
  recordId: string;
};

export const RecordShowRightDrawerOpenRecordButton = ({
  objectNameSingular,
  recordId,
}: RecordShowRightDrawerOpenRecordButtonProps) => {
  const record = useAtomFamilyStateValue(recordStoreFamilyState, recordId) as
    | ObjectRecord
    | null
    | undefined;
  const { closeCommandMenu } = useCommandMenu();

  const commandMenuPageComponentInstance = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  );

  const tabListComponentId = getShowPageTabListComponentId({
    pageId: commandMenuPageComponentInstance?.instanceId,
    targetObjectId: recordId,
  });

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const tabListComponentIdInRecordPage = getShowPageTabListComponentId({
    targetObjectId: recordId,
  });

  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    tabListComponentIdInRecordPage,
  );

  const parentViewState = useAtomComponentStateCallbackState(
    contextStoreRecordShowParentViewComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const store = useStore();

  const navigate = useNavigateApp();

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { closeDropdown } = useCloseDropdown();

  const handleOpenRecord = useCallback(() => {
    const tabIdToOpen =
      activeTabId === 'home'
        ? objectNameSingular === CoreObjectNameSingular.Note ||
          objectNameSingular === CoreObjectNameSingular.Task
          ? 'richText'
          : 'timeline'
        : activeTabId;

    setActiveTabId(tabIdToOpen);

    const parentView = store.get(parentViewState);

    if (parentView?.parentViewObjectNameSingular !== objectNameSingular) {
      store.set(parentViewState, undefined);
    }

    navigate(AppPath.RecordShowPage, {
      objectNameSingular,
      objectRecordId: recordId,
    });

    closeDropdown(
      getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId),
    );

    closeCommandMenu();
  }, [
    actionMenuId,
    activeTabId,
    closeCommandMenu,
    closeDropdown,
    navigate,
    objectNameSingular,
    parentViewState,
    recordId,
    setActiveTabId,
    store,
  ]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleOpenRecord,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleOpenRecord],
  });

  if (!isDefined(record)) {
    return null;
  }

  return (
    <Button
      title={t`Open`}
      variant="primary"
      accent="blue"
      size="small"
      Icon={IconBrowserMaximize}
      hotkeys={[getOsControlSymbol(), '⏎']}
      onClick={handleOpenRecord}
    />
  );
};
