import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isConfigVariablesInDbEnabledState = createAtomState<boolean>({
  key: 'isConfigVariablesInDbEnabled',
  defaultValue: false,
});
