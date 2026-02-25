import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isSidePanelAnimatingStateV2 = createAtomState<boolean>({
  key: 'command-menu/isSidePanelAnimatingStateV2',
  defaultValue: false,
});
