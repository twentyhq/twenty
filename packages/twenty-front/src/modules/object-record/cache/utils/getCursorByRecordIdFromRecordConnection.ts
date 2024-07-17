import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type CursorByRecordId = {
  cursor: string;
  recordId: string;
};

export const getCursorByRecordIdFromRecordConnection = ({
  recordConnection,
}: {
  recordConnection: RecordGqlConnection | undefined;
}): CursorByRecordId[] => {
  return (
    recordConnection?.edges.map((edge) => ({
      cursor: edge.cursor,
      recordId: edge.node.id,
    })) ?? []
  );
};
