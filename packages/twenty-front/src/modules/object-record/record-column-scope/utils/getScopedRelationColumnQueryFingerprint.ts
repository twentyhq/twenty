import { type RecordGqlFields } from 'twenty-shared/types';

// Response keys are derived from each scope's arguments, so the fingerprint changes whenever a scope does
export const getScopedRelationColumnQueryFingerprint = (
  scopedRelationRecordGqlFields: RecordGqlFields,
): string => Object.keys(scopedRelationRecordGqlFields).toSorted().join();
