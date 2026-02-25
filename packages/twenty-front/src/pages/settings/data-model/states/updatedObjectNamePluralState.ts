import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const updatedObjectNamePluralState = createAtomState<string>({
  key: 'updatedObjectNamePluralState',
  defaultValue: '',
});
