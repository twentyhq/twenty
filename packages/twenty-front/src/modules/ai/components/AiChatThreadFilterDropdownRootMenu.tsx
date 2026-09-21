import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
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
import { type AiChatThreadFilterDropdownPage } from '@/ai/types/AiChatThreadFilterDropdownPage';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
        <ListItem
          startIcon={<IconStatusChange />}
          description={t(
            AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus],
          )}
          descriptionPlacement="end"
          hasSubmenu
          onClick={getDropdownMenuItemClickHandler(() =>
            onSelectPage(AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.STATUS),
          )}
        >
          <OverflowingTextWithTooltip text={t`Status`} />
        </ListItem>
        <ListItem
          startIcon={<IconLayoutList />}
          description={t(
            AGENT_CHAT_THREAD_GROUP_BY_LABELS[agentChatThreadGroupBy],
          )}
          descriptionPlacement="end"
          hasSubmenu
          onClick={getDropdownMenuItemClickHandler(() =>
            onSelectPage(AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.GROUP_BY),
          )}
        >
          <OverflowingTextWithTooltip text={t`Group by`} />
        </ListItem>
        <ListItem
          startIcon={<IconClock />}
          description={t(
            AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_LABELS[
              agentChatThreadLastActivityFilter
            ],
          )}
          descriptionPlacement="end"
          hasSubmenu
          onClick={getDropdownMenuItemClickHandler(() =>
            onSelectPage(AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.LAST_ACTIVITY),
          )}
        >
          <OverflowingTextWithTooltip text={t`Last activity`} />
        </ListItem>
        {!isAtDefaults && (
          <>
            <DropdownMenuSeparator />
            <ListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={getDropdownMenuItemClickHandler(handleClearFilters)}
            >
              <OverflowingTextWithTooltip text={t`Clear filters`} />
            </ListItem>
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
