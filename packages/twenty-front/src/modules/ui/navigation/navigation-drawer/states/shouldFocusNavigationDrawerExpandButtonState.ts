import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldFocusNavigationDrawerExpandButtonState =
  createAtomState<boolean>({
    key: 'shouldFocusNavigationDrawerExpandButtonState',
    defaultValue: false,
  });
