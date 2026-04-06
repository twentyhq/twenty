import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sidePanelSearchContextObjectNameSingularState =
  createAtomState<string | null>({
    key: 'side-panel/sidePanelSearchContextObjectNameSingularState',
    defaultValue: null,
  });
