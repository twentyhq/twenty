import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelectorV2';
import { WorkflowVersionComponentInstanceContext } from '@/workflow/states/context/WorkflowVersionComponentInstanceContext';
import { stepsOutputSchemaComponentFamilyState } from '@/workflow/states/stepsOutputSchemaFamilyState';
import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';

export const stepOutputSchemaFamilySelector = createComponentFamilySelectorV2<
  StepOutputSchema | null,
  string
>({
  key: 'stepOutputSchemaFamilySelectorV2',
  componentInstanceContext: WorkflowVersionComponentInstanceContext,
  get:
    ({ instanceId, familyKey }) =>
    ({ get }) => {
      return get(
        stepsOutputSchemaComponentFamilyState.atomFamily({
          familyKey,
          instanceId,
        }),
      );
    },
});
