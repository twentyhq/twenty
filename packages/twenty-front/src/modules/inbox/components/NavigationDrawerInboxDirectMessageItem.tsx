import { InboxThreadActionsDropdown } from '@/inbox/components/InboxThreadActionsDropdown';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { type InboxDirectMessageSidebarItem } from '@/inbox/types/InboxDirectMessageSidebarItem';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';

type NavigationDrawerInboxDirectMessageItemProps = {
  directMessage: InboxDirectMessageSidebarItem;
  isActive: boolean;
  onSelect: (threadId: string) => void;
};

export const NavigationDrawerInboxDirectMessageItem = ({
  directMessage,
  isActive,
  onSelect,
}: NavigationDrawerInboxDirectMessageItemProps) => {
  const { t } = useLingui();
  const peerName = directMessage.peer?.name ?? t`Former member`;
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    directMessage.threadId,
  );
  const actionsInstanceId = useId();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    getCommandMenuDropdownIdFromCommandMenuId(actionsInstanceId),
  );

  return (
    <NavigationDrawerItem
      label={peerName}
      Icon={
        <Avatar
          name={peerName}
          src={directMessage.peer?.avatarUrl}
          colorSeed={
            directMessage.peer?.workspaceMemberId ?? directMessage.threadId
          }
          shape="circle"
          size="md"
        />
      }
      active={isActive}
      isUnread={directMessage.isUnread}
      onClick={() => onSelect(directMessage.threadId)}
      triggerEvent="CLICK"
      preventCollapseOnMobile
      isRightOptionsDropdownOpen={isDropdownOpen}
      rightOptions={
        isDefined(thread) ? (
          <InboxThreadActionsDropdown
            thread={thread}
            instanceId={actionsInstanceId}
          />
        ) : undefined
      }
    />
  );
};
