import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const navigationMemorizedUrlState = createAtomState<string>({
  key: 'navigationMemorizedUrlState',
  defaultValue: '/',
});
