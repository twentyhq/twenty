import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const createRecordObjectMetadataItemIdComponentState =
  createAtomComponentState<string | null>({
    key: 'side-panel/create-record-object-metadata-item-id',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
