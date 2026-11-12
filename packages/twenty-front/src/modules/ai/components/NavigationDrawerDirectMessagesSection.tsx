import { NavigationDrawerDirectMessageItem } from '@/ai/components/NavigationDrawerDirectMessageItem';
import { AI_CHAT_INBOX_DIRECT_MESSAGES_COLLAPSED_MAX_COUNT } from '@/ai/constants/AiChatInboxDirectMessagesCollapsedMaxCount';
import { AI_CHAT_INBOX_DIRECT_MESSAGES_EXPANDED_MAX_COUNT } from '@/ai/constants/AiChatInboxDirectMessagesExpandedMaxCount';
import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';
import { getVisibleDirectMessageSidebarItems } from '@/ai/utils/getVisibleDirectMessageSidebarItems';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

const AI_CHAT_DIRECT_MESSAGES_NAVIGATION_SECTION_ID = 'AiChatDirectMessages';

type NavigationDrawerDirectMessagesSectionProps = {
  directMessages: readonly DirectMessageSidebarItem[];
  currentThreadId: string | null;
  onSelect: (threadId: string) => void;
  memberPicker: ReactNode;
};

export const NavigationDrawerDirectMessagesSection = ({
  directMessages,
  currentThreadId,
  onSelect,
  memberPicker,
}: NavigationDrawerDirectMessagesSectionProps) => {
  const { t } = useLingui();
  const isNavigationDrawerContentExpanded =
    useIsNavigationDrawerContentExpanded();
  const [isShowingMore, setIsShowingMore] = useState(false);

  const collapsedDirectMessages = getVisibleDirectMessageSidebarItems({
    directMessages,
    currentThreadId,
    maxCount: AI_CHAT_INBOX_DIRECT_MESSAGES_COLLAPSED_MAX_COUNT,
  });
  const expandedDirectMessages = getVisibleDirectMessageSidebarItems({
    directMessages,
    currentThreadId,
    maxCount: AI_CHAT_INBOX_DIRECT_MESSAGES_EXPANDED_MAX_COUNT,
  });
  const hasMoreDirectMessages =
    expandedDirectMessages.length > collapsedDirectMessages.length;
  const visibleDirectMessages = isShowingMore
    ? expandedDirectMessages
    : collapsedDirectMessages;

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_DIRECT_MESSAGES_NAVIGATION_SECTION_ID}
      label={t`Direct messages`}
      rightIcon={memberPicker}
      alwaysShowRightIcon
    >
      {visibleDirectMessages.map((directMessage) => (
        <NavigationDrawerDirectMessageItem
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
