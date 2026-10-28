import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

import { NavigationDrawerAiChatInboxItem } from '@/ai/components/NavigationDrawerAiChatInboxItem';
import { NavigationDrawerAiChatInboxOpenGroup } from '@/ai/components/NavigationDrawerAiChatInboxOpenGroup';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AI_CHAT_INBOX_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatInboxNavigationSectionId';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerSectionSeeMoreItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionSeeMoreItem';
import { useNavigationSectionVisibleItems } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSectionVisibleItems';

const TRIAGE_FILTER_STATUSES = [
  AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
  AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
  AGENT_CHAT_THREAD_FILTER_STATUS.DONE,
];

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
  const {
    visibleItems: visibleFilterStatuses,
    isOverVisibleItemLimit,
    isShowingAllItems,
    toggleShowingAllItems,
  } = useNavigationSectionVisibleItems({
    navigationSectionId: AI_CHAT_INBOX_NAVIGATION_SECTION_ID,
    items: TRIAGE_FILTER_STATUSES,
    visibleItemLimit,
  });

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_INBOX_NAVIGATION_SECTION_ID}
      label={label ?? t`Inbox`}
      rightIcon={rightIcon}
      alwaysShowRightIcon={alwaysShowRightIcon}
    >
      {visibleFilterStatuses.map((filterStatus) =>
        filterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE ? (
          <NavigationDrawerAiChatInboxOpenGroup key={filterStatus} />
        ) : (
          <NavigationDrawerAiChatInboxItem
            key={filterStatus}
            filterStatus={filterStatus}
          />
        ),
      )}
      {isOverVisibleItemLimit && (
        <NavigationDrawerSectionSeeMoreItem
          isShowingAllItems={isShowingAllItems}
          onClick={toggleShowingAllItems}
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
