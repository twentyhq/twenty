import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';

import { NavigationDrawerInboxTriageItem } from '@/inbox/components/NavigationDrawerInboxTriageItem';
import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { INBOX_TRIAGE_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxTriageNavigationSectionId';

type NavigationDrawerInboxTriageSectionProps = {
  label?: string;
  headerAction?: ReactNode;
};

export const NavigationDrawerInboxTriageSection = ({
  label,
  headerAction,
}: NavigationDrawerInboxTriageSectionProps) => {
  const { t } = useLingui();
  const { openThreadCount, hasUnreadOpenThread } = useInboxOpenThreadsSummary();

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={INBOX_TRIAGE_NAVIGATION_SECTION_ID}
      label={label ?? t`Triage`}
      rightIcon={headerAction}
      alwaysShowRightIcon={isDefined(headerAction)}
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
