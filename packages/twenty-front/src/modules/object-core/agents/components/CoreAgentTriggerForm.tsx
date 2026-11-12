import { useState } from 'react';
import { type AgentTrigger } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { CoreAgentRecordTriggerForm } from '@/object-core/agents/components/CoreAgentRecordTriggerForm';
import { coreAgentTriggerSchema } from '@/object-core/agents/validation-schemas/coreAgentTriggerSchema';
import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { WorkflowEditTriggerCronForm } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerCronForm';

type CoreAgentTriggerFormProps = {
  trigger: AgentTrigger;
  isReadOnly: boolean;
  onTriggerChange: (nextTrigger: AgentTrigger) => void;
};

export const CoreAgentTriggerForm = ({
  trigger,
  isReadOnly,
  onTriggerChange,
}: CoreAgentTriggerFormProps) => {
  const [cronTrigger, setCronTrigger] = useState<
    WorkflowCronTrigger | undefined
  >(() =>
    trigger.type === 'CRON'
      ? {
          type: 'CRON',
          settings: { pattern: trigger.settings.pattern, outputSchema: {} },
        }
      : undefined,
  );

  if (trigger.type === 'CRON' && isDefined(cronTrigger)) {
    const handleCronTriggerUpdate = (nextCronTrigger: WorkflowCronTrigger) => {
      setCronTrigger(nextCronTrigger);

      const nextTrigger = {
        ...trigger,
        settings: { pattern: nextCronTrigger.settings.pattern },
      };

      if (!coreAgentTriggerSchema.safeParse(nextTrigger).success) {
        return;
      }

      onTriggerChange(nextTrigger);
    };

    return (
      <WorkflowEditTriggerCronForm
        trigger={cronTrigger}
        hasFooter={false}
        triggerOptions={
          isReadOnly
            ? { readonly: true }
            : { onTriggerUpdate: handleCronTriggerUpdate }
        }
      />
    );
  }

  if (trigger.type !== 'DATABASE_EVENT') {
    return null;
  }

  return (
    <CoreAgentRecordTriggerForm
      trigger={trigger}
      isReadOnly={isReadOnly}
      onTriggerUpdate={onTriggerChange}
    />
  );
};
