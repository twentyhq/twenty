import { WORKFLOW_STEP_DEFAULT_NAMES } from '@/workflow/constants/WorkflowStepDefaultNames';
import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getWorkflowStepDisplayName = ({
  name,
  type,
}: {
  name: string;
  type: WorkflowActionType | WorkflowTriggerType;
}): string => {
  const defaultName = WORKFLOW_STEP_DEFAULT_NAMES.find(
    (stepDefaultName) =>
      stepDefaultName.type === type && stepDefaultName.name === name,
  );

  return isDefined(defaultName) ? t(defaultName.label) : name;
};
