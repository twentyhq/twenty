import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isCommandMenuClosingState = createAtomState({
  key: 'command-menu/isCommandMenuClosingState',
  defaultValue: false,
});
