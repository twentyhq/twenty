import { useLingui } from '@lingui/react/macro';
import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';

import { NavigationDrawerAiChatTriageItem } from '@/ai/components/NavigationDrawerAiChatTriageItem';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
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
        presetFilter={AGENT_CHAT_THREAD_PRESET_FILTER.OPEN}
        count={openThreadCount}
        isUnread={hasUnreadOpenThread}
      />
      <NavigationDrawerAiChatTriageItem
        presetFilter={AGENT_CHAT_THREAD_PRESET_FILTER.SNOOZED}
      />
      <NavigationDrawerAiChatTriageItem
        presetFilter={AGENT_CHAT_THREAD_PRESET_FILTER.DONE}
      />
    </CollapsibleNavigationDrawerSection>
  );
};
