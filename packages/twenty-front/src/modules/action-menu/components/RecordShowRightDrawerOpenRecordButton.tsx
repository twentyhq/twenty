import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { AppPath } from '@/types/AppPath';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useRecoilCallback, useRecoilValue } from 'recoil';
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
  const record = useRecoilValue<ObjectRecord | null | undefined>(
    recordStoreFamilyState(recordId),
  );
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

  const parentViewState = useRecoilComponentCallbackStateV2(
    contextStoreRecordShowParentViewComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const navigate = useNavigateApp();

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { closeDropdown } = useDropdownV2();

  const handleOpenRecord = useRecoilCallback(
    ({ snapshot, reset }) =>
      () => {
        const tabIdToOpen =
          activeTabIdInRightDrawer === 'home'
            ? objectNameSingular === CoreObjectNameSingular.Note ||
              objectNameSingular === CoreObjectNameSingular.Task
              ? 'richText'
              : 'timeline'
            : activeTabIdInRightDrawer;

        setActiveTabIdInRecordPage(tabIdToOpen);

        const parentView = snapshot.getLoadable(parentViewState).getValue();

        if (parentView?.parentViewObjectNameSingular !== objectNameSingular) {
          reset(parentViewState);
        }

        navigate(AppPath.RecordShowPage, {
          objectNameSingular,
          objectRecordId: recordId,
        });

        closeDropdown(
          getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId),
        );

        closeCommandMenu();
      },
    [
      actionMenuId,
      activeTabIdInRightDrawer,
      closeCommandMenu,
      closeDropdown,
      navigate,
      objectNameSingular,
      parentViewState,
      recordId,
      setActiveTabIdInRecordPage,
    ],
  );

  useScopedHotkeys(
    ['ctrl+Enter,meta+Enter'],
    handleOpenRecord,
    AppHotkeyScope.CommandMenuOpen,
    [handleOpenRecord],
  );

  if (!isDefined(record)) {
    return null;
  }

  return (
    <Button
      title="Open"
      variant="primary"
      accent="blue"
      size="medium"
      Icon={IconBrowserMaximize}
      hotkeys={[getOsControlSymbol(), '⏎']}
      onClick={handleOpenRecord}
    />
  );
};
