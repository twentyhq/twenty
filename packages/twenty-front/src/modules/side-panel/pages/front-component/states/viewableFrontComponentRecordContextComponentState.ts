import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

type FrontComponentRecordContext = {
  recordId: string;
  objectNameSingular: string;
};

export const viewableFrontComponentRecordContextComponentState =
  createAtomComponentState<FrontComponentRecordContext | null>({
    key: 'command-menu/viewable-front-component-record-context',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
