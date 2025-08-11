import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getRecordsFromRecordConnection = <T extends ObjectRecord>({
  recordConnection,
}: {
  recordConnection: RecordGqlConnection;
}): T[] => {
  return recordConnection?.edges?.map((edge) =>
    getRecordFromRecordNode<T>({ recordNode: edge.node }),
  );
};
