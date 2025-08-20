import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { WorkflowVariablesDropdownBase } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownBase';
import { WorkflowVariablesDropdownFindRecords } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownFindRecords';
import { WorkflowVariablesDropdownRecord } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownRecord';

export const getVariablesDropdownFromStepType = (
  stepType: WorkflowActionType,
) => {
  switch (stepType) {
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
      return WorkflowVariablesDropdownRecord;
    case 'FIND_RECORDS':
      return WorkflowVariablesDropdownFindRecords;
    case 'SEND_EMAIL':
    case 'FORM':
    case 'CODE':
    case 'HTTP_REQUEST':
    case 'AI_AGENT':
    case 'FILTER':
      return WorkflowVariablesDropdownBase;
  }
};
