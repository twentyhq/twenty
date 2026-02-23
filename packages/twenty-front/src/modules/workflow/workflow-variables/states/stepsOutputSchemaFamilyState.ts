import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

export const stepsOutputSchemaFamilyState = createFamilyStateV2<
  StepOutputSchemaV2 | null,
  string | undefined
>({
  key: 'stepsOutputSchemaFamilyState',
  defaultValue: null,
});
