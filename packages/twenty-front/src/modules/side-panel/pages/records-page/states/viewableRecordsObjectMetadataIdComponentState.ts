import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableRecordsObjectMetadataIdComponentState =
  createAtomComponentState<string | null>({
    key: 'side-panel/viewable-record-index-object-metadata-id',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
