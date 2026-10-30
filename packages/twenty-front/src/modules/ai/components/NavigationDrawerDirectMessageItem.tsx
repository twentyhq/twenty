import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
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
}: NavigationDrawerDirectMessageItemProps) => (
  <NavigationDrawerItem
    label={directMessage.peer.name}
    Icon={
      <Avatar
        name={directMessage.peer.name}
        src={directMessage.peer.avatarUrl}
        shape="circle"
        size="md"
      />
    }
    active={isActive}
    isUnread={directMessage.isUnread}
    onClick={() => onSelect(directMessage.threadId)}
    triggerEvent="CLICK"
    preventCollapseOnMobile
  />
);
