import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelPageHasUnsavedChangesComponentState =
  createAtomComponentState<boolean>({
    key: 'side-panel/page-has-unsaved-changes',
    defaultValue: false,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
