import { NavigationDrawerInboxDirectMessageItem } from '@/inbox/components/NavigationDrawerInboxDirectMessageItem';
import { INBOX_DIRECT_MESSAGES_COLLAPSED_MAX_COUNT } from '@/inbox/constants/InboxDirectMessagesCollapsedMaxCount';
import { INBOX_DIRECT_MESSAGES_EXPANDED_MAX_COUNT } from '@/inbox/constants/InboxDirectMessagesExpandedMaxCount';
import { type InboxDirectMessageSidebarItem } from '@/inbox/types/InboxDirectMessageSidebarItem';
import { getVisibleInboxDirectMessageSidebarItems } from '@/inbox/utils/getVisibleInboxDirectMessageSidebarItems';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

const INBOX_DIRECT_MESSAGES_NAVIGATION_SECTION_ID = 'AiChatDirectMessages';

type NavigationDrawerInboxDirectMessagesSectionProps = {
  directMessages: readonly InboxDirectMessageSidebarItem[];
  currentThreadId: string | null;
  onSelect: (threadId: string) => void;
  memberPicker: ReactNode;
};

export const NavigationDrawerInboxDirectMessagesSection = ({
  directMessages,
  currentThreadId,
  onSelect,
  memberPicker,
}: NavigationDrawerInboxDirectMessagesSectionProps) => {
  const { t } = useLingui();
  const isNavigationDrawerContentExpanded =
    useIsNavigationDrawerContentExpanded();
  const [isShowingMore, setIsShowingMore] = useState(false);

  const collapsedDirectMessages = getVisibleInboxDirectMessageSidebarItems({
    directMessages,
    currentThreadId,
    maxCount: INBOX_DIRECT_MESSAGES_COLLAPSED_MAX_COUNT,
  });
  const expandedDirectMessages = getVisibleInboxDirectMessageSidebarItems({
    directMessages,
    currentThreadId,
    maxCount: INBOX_DIRECT_MESSAGES_EXPANDED_MAX_COUNT,
  });
  const hasMoreDirectMessages =
    expandedDirectMessages.length > collapsedDirectMessages.length;
  const visibleDirectMessages = isShowingMore
    ? expandedDirectMessages
    : collapsedDirectMessages;

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={INBOX_DIRECT_MESSAGES_NAVIGATION_SECTION_ID}
      label={t`Direct messages`}
      rightIcon={memberPicker}
      alwaysShowRightIcon
    >
      {visibleDirectMessages.map((directMessage) => (
        <NavigationDrawerInboxDirectMessageItem
          key={directMessage.threadId}
          directMessage={directMessage}
          isActive={directMessage.threadId === currentThreadId}
          onSelect={onSelect}
        />
      ))}
      {hasMoreDirectMessages && isNavigationDrawerContentExpanded && (
        <NavigationDrawerItem
          label={isShowingMore ? t`Show less` : t`Show more`}
          Icon={isShowingMore ? IconChevronUp : IconChevronDown}
          variant="tertiary"
          aria-expanded={isShowingMore}
          onClick={() => setIsShowingMore(!isShowingMore)}
          triggerEvent="CLICK"
          preventCollapseOnMobile
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
