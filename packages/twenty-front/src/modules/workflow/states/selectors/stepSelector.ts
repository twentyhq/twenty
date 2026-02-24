import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import type { WorkflowAction } from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const createStepSelector = (stepId: string) =>
  createComponentSelectorV2<WorkflowAction | null>({
    key: `stepSelector-${stepId}`,
    get:
      (componentStateKey) =>
      ({ get }) => {
        const flowState = get(flowComponentState, componentStateKey);

        if (!isDefined(flowState) || !isDefined(flowState.steps)) {
          return null;
        }

        const step = flowState.steps.find(
          (step: WorkflowAction) => step.id === stepId,
        );

        return step ?? null;
      },
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
