import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { AppPath } from '@/types/AppPath';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button, IconBrowserMaximize, getOsControlSymbol } from 'twenty-ui';
import { useNavigateApp } from '~/hooks/useNavigateApp';
const StyledLink = styled(Link)`
  text-decoration: none;
`;

type RecordShowRightDrawerOpenRecordButtonProps = {
  objectNameSingular: string;
  record: ObjectRecord;
};

export const RecordShowRightDrawerOpenRecordButton = ({
  objectNameSingular,
  record,
}: RecordShowRightDrawerOpenRecordButtonProps) => {
  const { closeCommandMenu } = useCommandMenu();

  const commandMenuPageComponentInstance = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  );

  const tabListComponentId = getShowPageTabListComponentId({
    pageId: commandMenuPageComponentInstance?.instanceId,
    targetObjectId: record.id,
  });

  const activeTabIdInRightDrawer = useRecoilComponentValueV2(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const tabListComponentIdInRecordPage = getShowPageTabListComponentId({
    targetObjectId: record.id,
  });

  const setActiveTabIdInRecordPage = useSetRecoilComponentStateV2(
    activeTabIdComponentState,
    tabListComponentIdInRecordPage,
  );

  const to = getLinkToShowPage(objectNameSingular, record);

  const navigate = useNavigateApp();

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { closeDropdown } = useDropdownV2();

  const handleOpenRecord = useCallback(() => {
    const tabIdToOpen =
      activeTabIdInRightDrawer === 'home'
        ? objectNameSingular === CoreObjectNameSingular.Note ||
          objectNameSingular === CoreObjectNameSingular.Task
          ? 'richText'
          : 'timeline'
        : activeTabIdInRightDrawer;

    setActiveTabIdInRecordPage(tabIdToOpen);

    navigate(AppPath.RecordShowPage, {
      objectNameSingular,
      objectRecordId: record.id,
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
    record.id,
    setActiveTabIdInRecordPage,
  ]);

  useScopedHotkeys(
    ['ctrl+Enter,meta+Enter'],
    handleOpenRecord,
    AppHotkeyScope.CommandMenuOpen,
    [closeCommandMenu, navigate, objectNameSingular, record.id],
  );

  return (
    <StyledLink to={to} onClick={closeCommandMenu}>
      <Button
        title="Open"
        variant="primary"
        accent="blue"
        size="medium"
        Icon={IconBrowserMaximize}
        hotkeys={[getOsControlSymbol(), '⏎']}
      />
    </StyledLink>
  );
};
