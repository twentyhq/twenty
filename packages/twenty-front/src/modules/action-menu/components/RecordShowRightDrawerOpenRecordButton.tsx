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
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { t } from '@lingui/core/macro';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
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
  const record = useFamilyRecoilValueV2(recordStoreFamilyState, recordId) as
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

  const activeTabIdInRightDrawer = useRecoilComponentValueV2(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const tabListComponentIdInRecordPage = getShowPageTabListComponentId({
    targetObjectId: recordId,
  });

  const setActiveTabIdInRecordPage = useSetRecoilComponentStateV2(
    activeTabIdComponentState,
    tabListComponentIdInRecordPage,
  );

  const parentViewState = useRecoilComponentStateCallbackStateV2(
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
      activeTabIdInRightDrawer === 'home'
        ? objectNameSingular === CoreObjectNameSingular.Note ||
          objectNameSingular === CoreObjectNameSingular.Task
          ? 'richText'
          : 'timeline'
        : activeTabIdInRightDrawer;

    setActiveTabIdInRecordPage(tabIdToOpen);

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
    activeTabIdInRightDrawer,
    closeCommandMenu,
    closeDropdown,
    navigate,
    objectNameSingular,
    parentViewState,
    recordId,
    setActiveTabIdInRecordPage,
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
