import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { isDefined } from 'twenty-shared';

export const isRecordGqlFieldsNode = (
  recordGql: RecordGqlFields | boolean | undefined,
): recordGql is RecordGqlFields =>
  isDefined(recordGql) && typeof recordGql !== 'boolean';
