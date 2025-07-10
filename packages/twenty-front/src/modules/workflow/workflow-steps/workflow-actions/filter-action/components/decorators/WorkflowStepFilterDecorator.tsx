import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFilterGroupsComponentInstanceContext';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFiltersComponentInstanceContext';
import { Decorator } from '@storybook/react';

export const WorkflowStepFilterDecorator: Decorator = (Story) => {
  const stepId = 'step-id';

  return (
    <StepFilterGroupsComponentInstanceContext.Provider
      value={{
        instanceId: stepId,
      }}
    >
      <StepFiltersComponentInstanceContext.Provider
        value={{
          instanceId: stepId,
        }}
      >
        <Story />
      </StepFiltersComponentInstanceContext.Provider>
    </StepFilterGroupsComponentInstanceContext.Provider>
  );
};
