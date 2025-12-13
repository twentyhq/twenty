import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';
import { stepsOutputSchemaFamilyState } from '@/workflow/workflow-variables/states/stepsOutputSchemaFamilyState';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { selectorFamily } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const stepsOutputSchemaFamilySelector = selectorFamily<
  StepOutputSchemaV2[],
  { workflowVersionId: string; stepIds: string[] }
>({
  key: 'stepsOutputSchemaFamilySelector',
  get:
    ({ workflowVersionId, stepIds }) =>
    ({ get }) => {
      const stepsOutputSchema = stepIds
        .map((stepId) =>
          getStepOutputSchemaFamilyStateKey(workflowVersionId, stepId),
        )
        .map((stepOutputSchemaKey) =>
          get(stepsOutputSchemaFamilyState(stepOutputSchemaKey)),
        )
        .filter(isDefined);

      return stepsOutputSchema;
    },
});
