import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const selectedObjectMetadataIdForViewFlowState =
  createAtomComponentState<string | null>({
    key: 'side-panel/selected-object-metadata-id-for-view-flow',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
