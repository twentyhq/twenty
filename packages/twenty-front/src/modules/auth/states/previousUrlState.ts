import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const previousUrlState = createAtomState<string>({
  key: 'previousUrlState',
  defaultValue: '',
});
