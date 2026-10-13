import { type RecordGqlFields } from 'twenty-shared/types';

import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';
import { getActiveRecordFieldDisplayOverrides } from '@/object-record/record-field/ui/utils/getActiveRecordFieldDisplayOverrides';

export const getRecordFieldDisplayOverridesRecordGqlFields = (args: {
  recordFieldDisplayOverrides: RecordFieldDisplayOverride[];
  objectNameSingular: string | undefined;
  fieldNames: string[];
  currentWorkspace: CurrentWorkspace | null | undefined;
}) =>
  getActiveRecordFieldDisplayOverrides(args).reduce<RecordGqlFields>(
    (recordGqlFields, recordFieldDisplayOverride) => ({
      ...recordGqlFields,
      ...recordFieldDisplayOverride.recordGqlFields,
    }),
    {},
  );
