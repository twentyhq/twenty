import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type PendingRecordUpdateForm = {
  requestId: string;
  resolve: (completedFields: Partial<ObjectRecord> | null) => void;
};

export const pendingRecordUpdateFormState =
  createAtomState<PendingRecordUpdateForm | null>({
    key: 'record-form/pendingRecordUpdateFormState',
    defaultValue: null,
  });
