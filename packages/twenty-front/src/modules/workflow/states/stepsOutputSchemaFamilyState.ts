import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

export const stepsOutputSchemaFamilyState = createFamilyState<
  StepOutputSchemaV2 | null,
  string | undefined
>({
  key: 'stepsOutputSchemaFamilyState',
  defaultValue: null,
});
