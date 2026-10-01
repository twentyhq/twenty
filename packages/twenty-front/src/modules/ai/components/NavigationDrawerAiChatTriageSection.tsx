import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatOpenUnreadThreadCountSelector } from '@/ai/states/selectors/agentChatOpenUnreadThreadCountSelector';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID = 'AiChatTriage';

const TRIAGE_FILTER_STATUSES: AgentChatThreadFilterStatus[] = [
  AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
  AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
  AGENT_CHAT_THREAD_FILTER_STATUS.ARCHIVED,
];

export const NavigationDrawerAiChatTriageSection = () => {
  const { t } = useLingui();
  const location = useLocation();
  const navigate = useNavigateApp();
  const [agentChatThreadFilterStatus, setAgentChatThreadFilterStatus] =
    useAtomState(agentChatThreadFilterStatusState);
  const agentChatOpenUnreadThreadCount = useAtomStateValue(
    agentChatOpenUnreadThreadCountSelector,
  );
  const isOnInboxPage = isMatchingLocation(location, AppPath.AiChatInbox);

  const handleTriageClick = (filterStatus: AgentChatThreadFilterStatus) => {
    setAgentChatThreadFilterStatus(filterStatus);
    navigate(AppPath.AiChatInbox);
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID}
      label={t`Triage`}
    >
      {TRIAGE_FILTER_STATUSES.map((filterStatus) => (
        <NavigationDrawerItem
          key={filterStatus}
          label={t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[filterStatus])}
          secondaryLabel={
            filterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE &&
            agentChatOpenUnreadThreadCount > 0
              ? `${agentChatOpenUnreadThreadCount}`
              : undefined
          }
          Icon={AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[filterStatus]}
          active={isOnInboxPage && agentChatThreadFilterStatus === filterStatus}
          onClick={() => handleTriageClick(filterStatus)}
        />
      ))}
    </CollapsibleNavigationDrawerSection>
  );
};
