import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';

import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AGENT_CHAT_THREAD_GROUP_BY_LABELS } from '@/ai/constants/AgentChatThreadGroupByLabels';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const AGENT_CHAT_THREAD_GROUP_BY_OPTIONS = [
  AGENT_CHAT_THREAD_GROUP_BY.DATE,
  AGENT_CHAT_THREAD_GROUP_BY.NONE,
] as const;

export const AiChatThreadFilterDropdownGroupByMenu = () => {
  const { t } = useLingui();
  const [agentChatThreadGroupBy, setAgentChatThreadGroupBy] = useAtomState(
    agentChatThreadGroupByState,
  );

  return (
    <>
      <Dropdown.Back>{t`Group by`}</Dropdown.Back>
      <Dropdown.Section>
        {AGENT_CHAT_THREAD_GROUP_BY_OPTIONS.map((option) => (
          <Dropdown.OptionItem
            key={option}
            onSelect={() => {
              setAgentChatThreadGroupBy(option);
            }}
            selected={agentChatThreadGroupBy === option}
          >
            {t(AGENT_CHAT_THREAD_GROUP_BY_LABELS[option])}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
