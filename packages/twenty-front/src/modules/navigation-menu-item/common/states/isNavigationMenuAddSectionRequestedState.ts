import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isNavigationMenuAddSectionRequestedState =
  createAtomState<boolean>({
    key: 'isNavigationMenuAddSectionRequestedState',
    defaultValue: false,
  });
