import pick from 'lodash.pick';

import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

// Internal non-generic implementation to avoid recursive type instantiation issues
const getRecordFromRecordNodeInternal = (
  recordNode: RecordGqlNode,
): ObjectRecord => {
  return {
    ...Object.fromEntries(
      Object.entries(recordNode).map(([fieldName, value]) => {
        if (
          isUndefinedOrNull(value) ||
          Array.isArray(value) ||
          typeof value !== 'object'
        ) {
          return [fieldName, value];
        }

        return isDefined(value.edges)
          ? [
              fieldName,
              getRecordsFromRecordConnection({ recordConnection: value }),
            ]
          : [fieldName, getRecordFromRecordNodeInternal(value)];
      }),
    ),
    // Only adds `id` and `__typename` if they exist.
    // RawJson field value passes through this method and does not have `id` or `__typename`.
    // This prevents adding an undefined `id` and `__typename` to the RawJson field value,
    // which is invalid JSON.
    ...pick(recordNode, ['id', '__typename'] as const),
  };
};

// Public generic interface
export const getRecordFromRecordNode = <T extends ObjectRecord>({
  recordNode,
}: {
  recordNode: RecordGqlNode;
}): T => {
  return getRecordFromRecordNodeInternal(recordNode) as T;
};
