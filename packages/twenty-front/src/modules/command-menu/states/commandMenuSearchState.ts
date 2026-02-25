import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const commandMenuSearchState = createAtomState<string>({
  key: 'command-menu/commandMenuSearchState',
  defaultValue: '',
});
