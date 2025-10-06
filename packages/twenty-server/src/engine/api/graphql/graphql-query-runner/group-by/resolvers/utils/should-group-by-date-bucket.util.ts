import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordGroupByDateBucket } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const shouldGroupByDateBucket = (
  fieldGroupByDefinition:
    | boolean
    | Record<string, boolean>
    | { bucket: ObjectRecordGroupByDateBucket }
    | undefined,
): fieldGroupByDefinition is { bucket: ObjectRecordGroupByDateBucket } => {
  return (
    typeof fieldGroupByDefinition === 'object' &&
    'bucket' in fieldGroupByDefinition &&
    isDefined(fieldGroupByDefinition.bucket) &&
    !isBoolean(fieldGroupByDefinition.bucket)
  );
};
