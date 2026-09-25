import { type FrontComponentRecordContext } from '@/side-panel/pages/front-component/types/FrontComponentRecordContext';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableFrontComponentRecordContextComponentState =
  createAtomComponentState<FrontComponentRecordContext | null>({
    key: 'side-panel/viewable-front-component-record-context',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
