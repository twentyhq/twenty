import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getRecordsFromRecordConnection = <T extends ObjectRecord>({
  recordConnection,
}: {
  recordConnection: RecordGqlConnectionEdgesRequired;
}): T[] => {
  return recordConnection?.edges?.map((edge) =>
    getRecordFromRecordNode<T>({ recordNode: edge.node }),
  );
};
