import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const processedValidationRuleFormFillIdsState = createAtomState<
  string[]
>({
  key: 'processedValidationRuleFormFillIdsState',
  defaultValue: [],
});
