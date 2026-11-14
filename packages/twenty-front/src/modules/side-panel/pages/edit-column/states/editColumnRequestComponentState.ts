import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export type EditColumnRequest = {
  recordTableId: string;
  recordFieldId: string;
  // Persisted on save only, so cancelling an added column leaves nothing behind
  recordFieldToCreate?: RecordField;
  contextStoreInstanceId: string;
};

export const editColumnRequestComponentState =
  createAtomComponentState<EditColumnRequest | null>({
    key: 'side-panel/edit-column-request',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
