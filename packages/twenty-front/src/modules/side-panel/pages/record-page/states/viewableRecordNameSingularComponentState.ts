import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableRecordNameSingularComponentState =
  createAtomComponentState<string | null>({
    key: 'side-panel/viewable-record-name-singular',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
