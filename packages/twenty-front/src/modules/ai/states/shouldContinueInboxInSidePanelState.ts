import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldContinueInboxInSidePanelState = createAtomState<boolean>({
  key: 'shouldContinueInboxInSidePanelState',
  defaultValue: false,
});
