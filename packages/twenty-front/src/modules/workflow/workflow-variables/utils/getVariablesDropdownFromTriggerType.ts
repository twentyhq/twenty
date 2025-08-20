import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { WorkflowVariablesDropdownBase } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownBase';
import { WorkflowVariablesDropdownEventTrigger } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownEventTrigger';

export const getVariablesDropdownFromTriggerType = (
  triggerType: WorkflowTriggerType,
) => {
  switch (triggerType) {
    case 'DATABASE_EVENT':
      return WorkflowVariablesDropdownEventTrigger;
    case 'MANUAL':
    case 'CRON':
    case 'WEBHOOK':
      return WorkflowVariablesDropdownBase;
  }
};
