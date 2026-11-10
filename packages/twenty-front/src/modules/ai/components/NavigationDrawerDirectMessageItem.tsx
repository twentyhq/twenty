import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useLingui } from '@lingui/react/macro';
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
    />
  );
};
