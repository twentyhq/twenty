import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { useLingui } from '@lingui/react/macro';
import { IconChevronLeft } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const AGENT_CHAT_THREAD_FILTER_STATUS_OPTIONS = [
  AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
  AGENT_CHAT_THREAD_FILTER_STATUS.ARCHIVED,
  AGENT_CHAT_THREAD_FILTER_STATUS.ALL,
] as const;

type AiChatThreadFilterDropdownStatusMenuProps = {
  onBack: () => void;
};

export const AiChatThreadFilterDropdownStatusMenu = ({
  onBack,
}: AiChatThreadFilterDropdownStatusMenuProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const [agentChatThreadFilterStatus, setAgentChatThreadFilterStatus] =
    useAtomState(agentChatThreadFilterStatusState);

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
        {t`Status`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {AGENT_CHAT_THREAD_FILTER_STATUS_OPTIONS.map((option) => (
          <ListItem
            key={option}
            onClick={() => {
              setAgentChatThreadFilterStatus(option);
              closeDropdown();
            }}
            role="option"
            aria-selected={agentChatThreadFilterStatus === option}
            selected={agentChatThreadFilterStatus === option}
            indicator="check"
          >
            <OverflowingTextWithTooltip
              text={t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[option])}
            />
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
