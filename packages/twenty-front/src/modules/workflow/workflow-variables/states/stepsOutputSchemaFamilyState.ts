import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

export const stepsOutputSchemaFamilyState = createAtomFamilyState<
  StepOutputSchemaV2 | null,
  string | undefined
>({
  key: 'stepsOutputSchemaFamilyState',
  defaultValue: null,
});
