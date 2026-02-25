import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCommandMenuOpenedStateV2 = createAtomState<boolean>({
  key: 'command-menu/isCommandMenuOpenedStateV2',
  defaultValue: false,
});
