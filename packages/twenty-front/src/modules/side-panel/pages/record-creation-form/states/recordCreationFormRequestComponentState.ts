import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export type RecordCreationFormRequest = {
  requestId: string;
  objectMetadataId: string;
  initialDraftRecord: Partial<ObjectRecord>;
  canCreateAnother: boolean;
};

export const recordCreationFormRequestComponentState =
  createAtomComponentState<RecordCreationFormRequest | null>({
    key: 'side-panel/record-creation-form-request',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
