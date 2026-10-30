import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { type AgentTrigger } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { CoreAgentRecordTriggerForm } from '@/object-core/agents/components/CoreAgentRecordTriggerForm';
import { getWorkflowCronTriggerFromCoreAgentTrigger } from '@/object-core/agents/utils/getWorkflowCronTriggerFromCoreAgentTrigger';
import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
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
  const [cronPattern, setCronPattern] = useState(
    trigger.type === 'CRON' ? trigger.settings.pattern : undefined,
  );

  if (trigger.type === 'CRON' && trigger.settings.pattern !== cronPattern) {
    setCronPattern(trigger.settings.pattern);
    setCronTrigger(getWorkflowCronTriggerFromCoreAgentTrigger(trigger));
  }

  if (trigger.type === 'CRON' && isDefined(cronTrigger)) {
    const handleCronTriggerUpdate = (nextCronTrigger: WorkflowCronTrigger) => {
      setCronTrigger(nextCronTrigger);

      const pattern = convertScheduleToCronExpression(nextCronTrigger);

      if (!isNonEmptyString(pattern)) {
        return;
      }

      setCronPattern(pattern);
      onTriggerChange({ ...trigger, settings: { pattern } });
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
