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
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { t } from '@lingui/core/macro';
import { useRecoilCallback, useRecoilValue } from 'recoil';
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

  const activeTabIdInRightDrawer = useRecoilComponentValue(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const tabListComponentIdInRecordPage = getShowPageTabListComponentId({
    targetObjectId: recordId,
  });

  const setActiveTabIdInRecordPage = useSetRecoilComponentState(
    activeTabIdComponentState,
    tabListComponentIdInRecordPage,
  );

  const parentViewState = useRecoilComponentCallbackState(
    contextStoreRecordShowParentViewComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const navigate = useNavigateApp();

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { closeDropdown } = useCloseDropdown();

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
