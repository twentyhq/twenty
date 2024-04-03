import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const getRecordFromRecordNode = <T extends ObjectRecord>({
  recordNode,
}: {
  recordNode: T;
}): T => {
  return {
    ...Object.fromEntries(
      Object.entries(recordNode).map(([fieldName, value]) => {
        if (isUndefinedOrNull(value)) {
          return [fieldName, value];
        }

        if (typeof value === 'object' && isDefined(value.edges)) {
          return [
            fieldName,
            getRecordsFromRecordConnection({ recordConnection: value }),
          ];
        }

        if (typeof value === 'object' && !isDefined(value.edges)) {
          return [fieldName, getRecordFromRecordNode<T>({ recordNode: value })];
        }

        return [fieldName, value];
      }),
    ),
    id: recordNode.id,
  } as T;
};
