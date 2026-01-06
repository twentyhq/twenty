import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';
import { type Decorator } from '@storybook/react';

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
