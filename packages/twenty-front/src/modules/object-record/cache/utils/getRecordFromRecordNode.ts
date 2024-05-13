import pick from 'lodash.pick';

import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const getRecordFromRecordNode = <T extends ObjectRecord>({
  recordNode,
}: {
  recordNode: RecordGqlNode;
}): T => {
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
          : [fieldName, getRecordFromRecordNode<T>({ recordNode: value })];
      }),
    ),
    // Only adds `id` and `__typename` if they exist.
    // RawJson field value passes through this method and does not have `id` or `__typename`.
    // This prevents adding an undefined `id` and `__typename` to the RawJson field value,
    // which is invalid JSON.
    ...pick(recordNode, ['id', '__typename'] as const),
  } as T;
};
