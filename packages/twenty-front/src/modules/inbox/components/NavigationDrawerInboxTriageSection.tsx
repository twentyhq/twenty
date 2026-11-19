import { useLingui } from '@lingui/react/macro';
import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';

import { NavigationDrawerInboxTriageItem } from '@/inbox/components/NavigationDrawerInboxTriageItem';
import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';

const INBOX_TRIAGE_NAVIGATION_SECTION_ID = 'AiChatTriage';

export const NavigationDrawerInboxTriageSection = () => {
  const { t } = useLingui();
  const { openThreadCount, hasUnreadOpenThread } = useInboxOpenThreadsSummary();

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={INBOX_TRIAGE_NAVIGATION_SECTION_ID}
      label={t`Triage`}
    >
      <NavigationDrawerInboxTriageItem
        presetFilter={AGENT_CHAT_THREAD_PRESET_FILTER.OPEN}
        count={openThreadCount}
        isUnread={hasUnreadOpenThread}
      />
      <NavigationDrawerInboxTriageItem
        presetFilter={AGENT_CHAT_THREAD_PRESET_FILTER.SNOOZED}
      />
      <NavigationDrawerInboxTriageItem
        presetFilter={AGENT_CHAT_THREAD_PRESET_FILTER.DONE}
      />
    </CollapsibleNavigationDrawerSection>
  );
};
