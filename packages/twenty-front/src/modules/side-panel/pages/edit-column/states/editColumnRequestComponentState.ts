import { type EditColumnKind } from '@/side-panel/pages/edit-column/types/EditColumnKind';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export type EditColumnRequest = {
  recordTableId: string;
  contextStoreInstanceId: string;
  viewId: string;
  fieldMetadataItemId: string;
  kind: EditColumnKind;
  // Absent for a column that only exists once saved, so cancelling leaves nothing behind
  recordFieldId?: string;
};

export const editColumnRequestComponentState =
  createAtomComponentState<EditColumnRequest | null>({
    key: 'side-panel/edit-column-request',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
