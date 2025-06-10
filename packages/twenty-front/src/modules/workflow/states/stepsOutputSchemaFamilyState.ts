import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';

export const stepsOutputSchemaFamilyState = createFamilyState<
  StepOutputSchema | null,
  string | undefined
>({
  key: 'stepsOutputSchemaFamilyState',
  defaultValue: null,
});
