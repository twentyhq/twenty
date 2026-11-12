import { AiChatMemberPresence } from '@/ai/components/AiChatMemberPresence';
import { AiChatThreadActionsDropdown } from '@/ai/components/AiChatThreadActionsDropdown';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';

type NavigationDrawerDirectMessageItemProps = {
  directMessage: DirectMessageSidebarItem;
  isActive: boolean;
  onSelect: (threadId: string) => void;
};

export const NavigationDrawerDirectMessageItem = ({
  directMessage,
  isActive,
  onSelect,
}: NavigationDrawerDirectMessageItemProps) => {
  const { t } = useLingui();
  const peerName = directMessage.peer?.name ?? t`Former member`;
  const thread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
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
        <AiChatMemberPresence
          workspaceMemberId={directMessage.peer?.workspaceMemberId}
        >
          <Avatar
            name={peerName}
            src={directMessage.peer?.avatarUrl}
            colorSeed={
              directMessage.peer?.workspaceMemberId ?? directMessage.threadId
            }
            shape="circle"
            size="md"
          />
        </AiChatMemberPresence>
      }
      active={isActive}
      isUnread={directMessage.isUnread}
      onClick={() => onSelect(directMessage.threadId)}
      triggerEvent="CLICK"
      preventCollapseOnMobile
      isRightOptionsDropdownOpen={isDropdownOpen}
      rightOptions={
        isDefined(thread) ? (
          <AiChatThreadActionsDropdown
            thread={thread}
            instanceId={actionsInstanceId}
          />
        ) : undefined
      }
    />
  );
};
