import { SidePanelPageComponentInstanceContext } from '@/command-menu/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableRecordNameSingularComponentState =
  createAtomComponentState<string | null>({
    key: 'command-menu/viewable-record-name-singular',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
