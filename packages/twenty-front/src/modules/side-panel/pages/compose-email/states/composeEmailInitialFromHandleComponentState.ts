import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeEmailInitialFromHandleComponentState =
  createAtomComponentState<string | null>({
    key: 'side-panel/compose-email-initial-from-handle',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
