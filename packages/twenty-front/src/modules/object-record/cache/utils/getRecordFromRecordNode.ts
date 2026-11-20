import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { getRelationTotalCountRecordKey } from '@/object-record/cache/utils/getRelationTotalCountRecordKey';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const getRecordFromRecordNode = <T extends ObjectRecord>({
  recordNode,
}: {
  recordNode: RecordGqlNode;
}): T => {
  const { id, __typename } = recordNode;

  return {
    ...Object.fromEntries(
      Object.entries(recordNode).flatMap(([fieldName, value]) => {
        if (
          !isDefined(value) ||
          Array.isArray(value) ||
          typeof value !== 'object'
        ) {
          return [[fieldName, value]];
        }

        if (!isDefined(value.edges)) {
          return [
            [fieldName, getRecordFromRecordNode<T>({ recordNode: value })],
          ];
        }

        return [
          [
            fieldName,
            getRecordsFromRecordConnection({ recordConnection: value }),
          ],
          ...(isDefined(value.totalCount)
            ? [[getRelationTotalCountRecordKey(fieldName), value.totalCount]]
            : []),
        ];
      }),
    ),
    // Only adds `id` and `__typename` if they exist.
    // RawJson field value passes through this method and does not have `id` or `__typename`.
    // This prevents adding an undefined `id` and `__typename` to the RawJson field value,
    // which is invalid JSON.
    ...(isDefined(id) ? { id } : {}),
    ...(isDefined(__typename) ? { __typename } : {}),
  } as T;
};
