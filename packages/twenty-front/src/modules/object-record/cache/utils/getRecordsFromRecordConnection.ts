import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';

export const getRecordsFromRecordConnection = <T extends ObjectRecord>({
  recordConnection,
}: {
  recordConnection: ObjectRecordConnection<T>;
}): T[] => {
  return recordConnection.edges.map((edge) => edge.node);
};
