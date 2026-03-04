import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isSidePanelOpenedState = createAtomState<boolean>({
  key: 'command-menu/isSidePanelOpenedState',
  defaultValue: false,
});
