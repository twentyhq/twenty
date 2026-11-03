import { useCoreAgentField } from '@/object-core/agents/hooks/useCoreAgentField';
import { getCoreAgentEditableTrigger } from '@/object-core/agents/utils/getCoreAgentEditableTrigger';
import { updateCoreAgentTrigger } from '@/object-core/agents/utils/updateCoreAgentTrigger';
import { type AgentTrigger } from 'twenty-shared/application';

export const useCoreAgentTrigger = ({
  agentId,
  triggerId,
}: {
  agentId: string;
  triggerId: string;
}) => {
  const { value: triggers, setValue } = useCoreAgentField({
    field: 'triggers',
    agentId,
  });
  const trigger = (triggers ?? [])
    .map(getCoreAgentEditableTrigger)
    .find((item) => item?.id === triggerId);

  const updateTrigger = (update: (current: AgentTrigger) => AgentTrigger) => {
    setValue((current) =>
      updateCoreAgentTrigger({ triggers: current, triggerId, update }),
    );
  };

  return { trigger, updateTrigger };
};
