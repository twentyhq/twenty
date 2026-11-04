import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

import { NavigationDrawerAiChatInboxItem } from '@/ai/components/NavigationDrawerAiChatInboxItem';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AI_CHAT_INBOX_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatInboxNavigationSectionId';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerSectionSeeMoreItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionSeeMoreItem';
import { useNavigationSectionVisibleItems } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSectionVisibleItems';

type NavigationDrawerAiChatInboxSectionProps = {
  label?: string;
  rightIcon?: ReactNode;
  alwaysShowRightIcon?: boolean;
  visibleItemLimit?: number | null;
};

export const NavigationDrawerAiChatInboxSection = ({
  label,
  rightIcon,
  alwaysShowRightIcon,
  visibleItemLimit,
}: NavigationDrawerAiChatInboxSectionProps = {}) => {
  const { t } = useLingui();
  const { openThreadCount, hasUnreadOpenThread } =
    useAgentChatOpenThreadsSummary();
  const {
    visibleItems,
    isOverVisibleItemLimit,
    isShowingAllItems,
    toggleShowingAllItems,
  } = useNavigationSectionVisibleItems({
    navigationSectionId: AI_CHAT_INBOX_NAVIGATION_SECTION_ID,
    items: [
      {
        filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
        count: openThreadCount,
        isUnread: hasUnreadOpenThread,
      },
      { filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED },
      { filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.DONE },
    ],
    visibleItemLimit,
  });

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_INBOX_NAVIGATION_SECTION_ID}
      label={label ?? t`Inbox`}
      rightIcon={rightIcon}
      alwaysShowRightIcon={alwaysShowRightIcon}
    >
      {visibleItems.map(({ filterStatus, count, isUnread }) => (
        <NavigationDrawerAiChatInboxItem
          key={filterStatus}
          filterStatus={filterStatus}
          count={count}
          isUnread={isUnread}
        />
      ))}
      {isOverVisibleItemLimit && (
        <NavigationDrawerSectionSeeMoreItem
          isShowingAllItems={isShowingAllItems}
          onClick={toggleShowingAllItems}
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
