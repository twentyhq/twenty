import { useLingui } from '@lingui/react/macro';
import { IconChevronLeft } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AGENT_CHAT_THREAD_GROUP_BY_LABELS } from '@/ai/constants/AgentChatThreadGroupByLabels';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const AGENT_CHAT_THREAD_GROUP_BY_OPTIONS = [
  AGENT_CHAT_THREAD_GROUP_BY.DATE,
  AGENT_CHAT_THREAD_GROUP_BY.NONE,
] as const;

type AiChatThreadFilterDropdownGroupByMenuProps = {
  onBack: () => void;
};

export const AiChatThreadFilterDropdownGroupByMenu = ({
  onBack,
}: AiChatThreadFilterDropdownGroupByMenuProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const [agentChatThreadGroupBy, setAgentChatThreadGroupBy] = useAtomState(
    agentChatThreadGroupByState,
  );

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
        {t`Group by`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {AGENT_CHAT_THREAD_GROUP_BY_OPTIONS.map((option) => (
          <MenuItemSelect
            key={option}
            text={t(AGENT_CHAT_THREAD_GROUP_BY_LABELS[option])}
            selected={agentChatThreadGroupBy === option}
            onClick={() => {
              setAgentChatThreadGroupBy(option);
              closeDropdown();
            }}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
