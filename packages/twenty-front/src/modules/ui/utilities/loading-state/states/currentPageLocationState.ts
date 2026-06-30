import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const currentPageLocationState = createAtomState<string>({
  key: 'currentPageLocationState',
  defaultValue: '',
});
