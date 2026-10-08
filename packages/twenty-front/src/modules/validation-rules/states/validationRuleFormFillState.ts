import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ValidationRuleFormFill } from '@/validation-rules/types/ValidationRuleFormFill';

export const validationRuleFormFillState =
  createAtomState<ValidationRuleFormFill | null>({
    key: 'validationRuleFormFillState',
    defaultValue: null,
  });
