import { type RecordGqlFields } from 'twenty-shared/types';
import {
  isDefined,
  isRecordGqlFieldsRelationWithArguments,
} from 'twenty-shared/utils';

export const isRecordGqlFieldsNode = (
  recordGql: RecordGqlFields[string] | boolean | undefined,
): recordGql is RecordGqlFields =>
  isDefined(recordGql) &&
  typeof recordGql === 'object' &&
  recordGql !== null &&
  !Array.isArray(recordGql) &&
  !isRecordGqlFieldsRelationWithArguments(recordGql);
