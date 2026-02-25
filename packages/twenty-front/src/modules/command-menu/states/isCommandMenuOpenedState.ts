import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCommandMenuOpenedState = createAtomState<boolean>({
  key: 'command-menu/isCommandMenuOpenedState',
  defaultValue: false,
});
