import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';

export const getRecordsFromRecordConnection = <T extends ObjectRecord>({
  recordConnection,
}: {
  recordConnection: ObjectRecordConnection<T>;
}): T[] => {
  return recordConnection.edges.map((edge) =>
    getRecordFromRecordNode<T>({ recordNode: edge.node }),
  );
};
