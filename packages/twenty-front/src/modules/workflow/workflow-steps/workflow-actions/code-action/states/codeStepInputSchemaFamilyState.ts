import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type InputSchema } from 'twenty-shared/workflow';

export const codeStepInputSchemaFamilyState = createAtomFamilyState<
  InputSchema | undefined,
  string
>({
  key: 'codeStepInputSchemaFamilyState',
  defaultValue: undefined,
});
