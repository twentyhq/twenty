import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type RecordGqlConnectionWithOptionalPageInfo = Omit<
  RecordGqlConnection,
  'pageInfo'
> & {
  pageInfo?: RecordGqlConnection['pageInfo'];
};

export const getRecordsFromRecordConnection = <T extends ObjectRecord>({
  recordConnection,
}: {
  recordConnection: RecordGqlConnectionWithOptionalPageInfo;
}): T[] => {
  return recordConnection?.edges?.map((edge) =>
    getRecordFromRecordNode<T>({ recordNode: edge.node }),
  );
};
