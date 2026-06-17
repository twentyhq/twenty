import { useLingui } from '@lingui/react/macro';
import {
  IconClock,
  IconLayoutList,
  IconStatusChange,
  IconTrash,
} from 'twenty-ui/display';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AGENT_CHAT_THREAD_GROUP_BY_LABELS } from '@/ai/constants/AgentChatThreadGroupByLabels';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER } from '@/ai/constants/AgentChatThreadLastActivityFilter';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_LABELS } from '@/ai/constants/AgentChatThreadLastActivityFilterLabels';
import { AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE } from '@/ai/constants/AiChatThreadFilterDropdownPage';
import { type AiChatThreadFilterDropdownPage } from '@/ai/types/AiChatThreadFilterDropdownPage';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { MenuItem } from 'twenty-ui/navigation';

type AiChatThreadFilterDropdownRootMenuProps = {
  dropdownId: string;
  onSelectPage: (page: AiChatThreadFilterDropdownPage) => void;
};

export const AiChatThreadFilterDropdownRootMenu = ({
  dropdownId,
  onSelectPage,
}: AiChatThreadFilterDropdownRootMenuProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();

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
    closeDropdown(dropdownId);
  };

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        <MenuItem
          LeftIcon={IconStatusChange}
          text={t`Status`}
          contextualText={t(
            AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus],
          )}
          contextualTextPosition="right"
          hasSubMenu
          onClick={() =>
            onSelectPage(AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.STATUS)
          }
        />
        <MenuItem
          LeftIcon={IconLayoutList}
          text={t`Group by`}
          contextualText={t(
            AGENT_CHAT_THREAD_GROUP_BY_LABELS[agentChatThreadGroupBy],
          )}
          contextualTextPosition="right"
          hasSubMenu
          onClick={() =>
            onSelectPage(AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.GROUP_BY)
          }
        />
        <MenuItem
          LeftIcon={IconClock}
          text={t`Last activity`}
          contextualText={t(
            AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_LABELS[
              agentChatThreadLastActivityFilter
            ],
          )}
          contextualTextPosition="right"
          hasSubMenu
          onClick={() =>
            onSelectPage(AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.LAST_ACTIVITY)
          }
        />
        {!isAtDefaults && (
          <>
            <DropdownMenuSeparator />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Clear filters`}
              onClick={handleClearFilters}
            />
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
