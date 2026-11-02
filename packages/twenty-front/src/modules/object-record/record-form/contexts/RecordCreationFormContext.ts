import { type RecordCreationRequest } from '@/object-record/record-form/types/RecordCreationRequest';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordCreationFormContextValue = {
  requestRecordCreation: (
    request: RecordCreationRequest,
  ) => Promise<ObjectRecord | null>;
  settleRecordCreationDraft: (params: {
    requestId: string;
    draftRecord: Partial<ObjectRecord> | null;
    shouldKeepOpen?: boolean;
  }) => Promise<{ error?: unknown }>;
};

export const [
  RecordCreationFormContextProvider,
  useRecordCreationFormContextOrThrow,
] = createRequiredContext<RecordCreationFormContextValue>(
  'RecordCreationFormContext',
);
