import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { WorkflowVersionComponentInstanceContext } from '@/workflow/states/context/WorkflowVersionComponentInstanceContext';
import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';

export const stepsOutputSchemaComponentFamilyState =
  createComponentFamilyStateV2<StepOutputSchema | null, string>({
    key: 'stepsOutputSchemaComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: WorkflowVersionComponentInstanceContext,
  });
