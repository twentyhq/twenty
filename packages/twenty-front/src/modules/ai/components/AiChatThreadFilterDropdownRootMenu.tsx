import { Dropdown } from 'twenty-ui/components';
import { useLingui } from '@lingui/react/macro';
import {
  IconClock,
  IconLayoutList,
  IconStatusChange,
  IconTrash,
} from 'twenty-ui/icon';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AGENT_CHAT_THREAD_GROUP_BY_LABELS } from '@/ai/constants/AgentChatThreadGroupByLabels';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER } from '@/ai/constants/AgentChatThreadLastActivityFilter';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_LABELS } from '@/ai/constants/AgentChatThreadLastActivityFilterLabels';
import { AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE } from '@/ai/constants/AiChatThreadFilterDropdownPage';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const AiChatThreadFilterDropdownRootMenu = () => {
  const { t } = useLingui();

  const [agentChatThreadFilterStatus, setAgentChatThreadFilterStatus] =
    useAtomState(agentChatThreadFilterStatusState);
  const [agentChatThreadGroupBy, setAgentChatThreadGroupBy] = useAtomState(
    agentChatThreadGroupByState,
  );
  const [
    agentChatThreadLastActivityFilter,
    setAgentChatThreadLastActivityFilter,
  ] = useAtomState(agentChatThreadLastActivityFilterState);

  const isAtDefaults =
    agentChatThreadFilterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE &&
    agentChatThreadGroupBy === AGENT_CHAT_THREAD_GROUP_BY.DATE &&
    agentChatThreadLastActivityFilter ===
      AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ALL;

  const handleClearFilters = () => {
    setAgentChatThreadFilterStatus(AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE);
    setAgentChatThreadGroupBy(AGENT_CHAT_THREAD_GROUP_BY.DATE);
    setAgentChatThreadLastActivityFilter(
      AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ALL,
    );
  };

  return (
    <>
      <Dropdown.Section>
        <Dropdown.ActionItem
          startIcon={<IconStatusChange />}
          description={t(
            AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus],
          )}
          descriptionPlacement="end"
          hasSubmenu
          page={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.STATUS}
        >{t`Status`}</Dropdown.ActionItem>
        <Dropdown.ActionItem
          startIcon={<IconLayoutList />}
          description={t(
            AGENT_CHAT_THREAD_GROUP_BY_LABELS[agentChatThreadGroupBy],
          )}
          descriptionPlacement="end"
          hasSubmenu
          page={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.GROUP_BY}
        >{t`Group by`}</Dropdown.ActionItem>
        <Dropdown.ActionItem
          startIcon={<IconClock />}
          description={t(
            AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_LABELS[
              agentChatThreadLastActivityFilter
            ],
          )}
          descriptionPlacement="end"
          hasSubmenu
          page={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.LAST_ACTIVITY}
        >{t`Last activity`}</Dropdown.ActionItem>
        {!isAtDefaults && (
          <>
            <Dropdown.Separator />
            <Dropdown.ActionItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={handleClearFilters}
            >{t`Clear filters`}</Dropdown.ActionItem>
          </>
        )}
      </Dropdown.Section>
    </>
  );
};
