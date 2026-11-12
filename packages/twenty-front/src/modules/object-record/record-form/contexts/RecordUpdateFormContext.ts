import { type RecordUpdateFormCompletionRequest } from '@/object-record/record-form/types/RecordUpdateFormCompletionRequest';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordUpdateFormContextValue = {
  requestRecordUpdateFormCompletion: (
    request: RecordUpdateFormCompletionRequest,
  ) => Promise<Partial<ObjectRecord> | null>;
  settleRecordUpdateForm: (params: {
    requestId: string;
    completedFields: Partial<ObjectRecord> | null;
  }) => void;
};

export const [
  RecordUpdateFormContextProvider,
  useRecordUpdateFormContextOrThrow,
] = createRequiredContext<RecordUpdateFormContextValue>(
  'RecordUpdateFormContext',
);
