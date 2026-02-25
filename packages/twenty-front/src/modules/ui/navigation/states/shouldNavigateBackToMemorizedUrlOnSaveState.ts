import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldNavigateBackToMemorizedUrlOnSaveState =
  createAtomState<boolean>({
    key: 'shouldNavigateBackToMemorizedUrlOnSaveState',
    defaultValue: false,
  });
