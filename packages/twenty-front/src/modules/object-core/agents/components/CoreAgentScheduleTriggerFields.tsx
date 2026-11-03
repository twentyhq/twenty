import { useCoreAgentScheduleDraft } from '@/object-core/agents/hooks/useCoreAgentScheduleDraft';
import { CronScheduleFields } from '@/workflow/workflow-trigger/components/CronScheduleFields';
import { isDefined } from 'twenty-shared/utils';

type CoreAgentScheduleTriggerFieldsProps = {
  agentId: string;
  triggerId: string;
  disabled: boolean;
};

export const CoreAgentScheduleTriggerFields = ({
  agentId,
  triggerId,
  disabled,
}: CoreAgentScheduleTriggerFieldsProps) => {
  const { value, updateScheduleDraft } = useCoreAgentScheduleDraft({
    agentId,
    triggerId,
  });
  if (!isDefined(value)) {
    return null;
  }
  return (
    <CronScheduleFields
      value={value}
      onChange={updateScheduleDraft}
      readonly={disabled}
    />
  );
};
