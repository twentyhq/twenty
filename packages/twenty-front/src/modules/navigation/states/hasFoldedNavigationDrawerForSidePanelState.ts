import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasFoldedNavigationDrawerForSidePanelState =
  createAtomState<boolean>({
    key: 'navigation/hasFoldedNavigationDrawerForSidePanelState',
    defaultValue: false,
  });
