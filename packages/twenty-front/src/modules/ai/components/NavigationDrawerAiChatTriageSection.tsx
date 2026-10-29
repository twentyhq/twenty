import { useLingui } from '@lingui/react/macro';

import { NavigationDrawerAiChatTriageItem } from '@/ai/components/NavigationDrawerAiChatTriageItem';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';

const AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID = 'AiChatTriage';

export const NavigationDrawerAiChatTriageSection = () => {
  const { t } = useLingui();
  const { openThreadCount, hasUnreadOpenThread } =
    useAgentChatOpenThreadsSummary();

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID}
      label={t`Triage`}
    >
      <NavigationDrawerAiChatTriageItem
        filterStatus={AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE}
        count={openThreadCount}
        isUnread={hasUnreadOpenThread}
      />
      <NavigationDrawerAiChatTriageItem
        filterStatus={AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED}
      />
      <NavigationDrawerAiChatTriageItem
        filterStatus={AGENT_CHAT_THREAD_FILTER_STATUS.DONE}
      />
    </CollapsibleNavigationDrawerSection>
  );
};
