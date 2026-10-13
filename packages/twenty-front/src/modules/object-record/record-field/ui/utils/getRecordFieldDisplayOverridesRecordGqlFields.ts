import { type RecordGqlFields } from 'twenty-shared/types';

import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';
import { getMatchingRecordFieldDisplayOverrides } from '@/object-record/record-field/ui/utils/getMatchingRecordFieldDisplayOverrides';

export const getRecordFieldDisplayOverridesRecordGqlFields = (args: {
  recordFieldDisplayOverrides: RecordFieldDisplayOverride[];
  objectNameSingular: string | undefined;
  fieldNames: string[];
}) =>
  getMatchingRecordFieldDisplayOverrides(args).reduce<RecordGqlFields>(
    (recordGqlFields, recordFieldDisplayOverride) => ({
      ...recordGqlFields,
      ...recordFieldDisplayOverride.recordGqlFields,
    }),
    {},
  );
