import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordGroupByDateGranularity } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const shouldGroupByDateGranularity = (
  fieldGroupByDefinition:
    | boolean
    | Record<string, boolean>
    | { granularity: ObjectRecordGroupByDateGranularity }
    | undefined,
): fieldGroupByDefinition is {
  granularity: ObjectRecordGroupByDateGranularity;
} => {
  return (
    typeof fieldGroupByDefinition === 'object' &&
    'granularity' in fieldGroupByDefinition &&
    isDefined(fieldGroupByDefinition.granularity)
  );
};
