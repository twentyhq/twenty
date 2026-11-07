import { useLingui } from '@lingui/react/macro';

import { NavigationDrawerAiChatTriageItem } from '@/ai/components/NavigationDrawerAiChatTriageItem';
import { OpenDirectMessageButton } from '@/ai/components/OpenDirectMessageButton';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID = 'AiChatTriage';

export const NavigationDrawerAiChatTriageSection = () => {
  const { t } = useLingui();
  const { openThreadCount, hasUnreadOpenThread } =
    useAgentChatOpenThreadsSummary();
  const isDirectMessageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  );

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID}
      label={t`Triage`}
      rightIcon={
        isDirectMessageEnabled ? <OpenDirectMessageButton /> : undefined
      }
      alwaysShowRightIcon
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
