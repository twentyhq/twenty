import { useLingui } from '@lingui/react/macro';
import { IconChevronLeft } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER } from '@/ai/constants/AgentChatThreadLastActivityFilter';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_LABELS } from '@/ai/constants/AgentChatThreadLastActivityFilterLabels';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_OPTIONS = [
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ONE_DAY,
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.THREE_DAYS,
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.SEVEN_DAYS,
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.THIRTY_DAYS,
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ALL,
] as const;

type AiChatThreadFilterDropdownLastActivityMenuProps = {
  onBack: () => void;
};

export const AiChatThreadFilterDropdownLastActivityMenu = ({
  onBack,
}: AiChatThreadFilterDropdownLastActivityMenuProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const [
    agentChatThreadLastActivityFilter,
    setAgentChatThreadLastActivityFilter,
  ] = useAtomState(agentChatThreadLastActivityFilterState);

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Last activity`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_OPTIONS.map((option) => (
          <MenuItemSelect
            key={option}
            text={t(AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_LABELS[option])}
            selected={agentChatThreadLastActivityFilter === option}
            onClick={() => {
              setAgentChatThreadLastActivityFilter(option);
              closeDropdown();
            }}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
