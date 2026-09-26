import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleSearchState = createAtomState<string>({
  key: 'logConsoleSearchState',
  defaultValue: '',
});
