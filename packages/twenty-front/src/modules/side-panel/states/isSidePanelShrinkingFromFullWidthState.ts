import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isSidePanelShrinkingFromFullWidthState = createAtomState<boolean>({
  key: 'isSidePanelShrinkingFromFullWidthState',
  defaultValue: false,
});
