import { type RecordGqlFields } from 'twenty-shared/types';

import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';
import { getMatchingCoreRecordReferenceFields } from '@/object-record/record-field/ui/utils/getMatchingCoreRecordReferenceFields';

export const getCoreRecordReferenceFieldsRecordGqlFields = (args: {
  coreRecordReferenceFields: CoreRecordReferenceField[];
  objectNameSingular: string | undefined;
  fieldNames: string[];
}) =>
  getMatchingCoreRecordReferenceFields(args).reduce<RecordGqlFields>(
    (recordGqlFields, coreRecordReferenceField) => ({
      ...recordGqlFields,
      [coreRecordReferenceField.coreRecordIdFieldName]: true,
    }),
    {},
  );
