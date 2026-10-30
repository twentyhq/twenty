import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { type AgentTrigger } from 'twenty-shared/application';

import { CoreAgentRecordTriggerForm } from '@/object-core/agents/components/CoreAgentRecordTriggerForm';
import { getWorkflowCronTriggerFromCoreAgentTrigger } from '@/object-core/agents/utils/getWorkflowCronTriggerFromCoreAgentTrigger';
import { WorkflowEditTriggerCronForm } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerCronForm';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/convertScheduleToCronExpression';

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
  const [cronTrigger, setCronTrigger] = useState(() =>
    trigger.type === 'CRON'
      ? getWorkflowCronTriggerFromCoreAgentTrigger(trigger)
      : undefined,
  );

  if (trigger.type === 'CRON' && cronTrigger) {
    return (
      <WorkflowEditTriggerCronForm
        trigger={cronTrigger}
        hasFooter={false}
        triggerOptions={
          isReadOnly
            ? { readonly: true }
            : {
                onTriggerUpdate: (nextCronTrigger) => {
                  setCronTrigger(nextCronTrigger);

                  const pattern =
                    convertScheduleToCronExpression(nextCronTrigger);

                  if (isNonEmptyString(pattern)) {
                    onTriggerChange({ ...trigger, settings: { pattern } });
                  }
                },
              }
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
