import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { type RecordTableWidgetJunctionCreateThrough } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useCallback } from 'react';

export const useCreateJunctionRecordFromTableWidget = ({
  junctionCreateThrough,
}: {
  junctionCreateThrough: RecordTableWidgetJunctionCreateThrough;
}) => {
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular:
      junctionCreateThrough.junctionObjectMetadataNameSingular,
  });

  const createJunctionRecord = useCallback(
    async (targetRecordId: string) => {
      await createOneRecord({
        [junctionCreateThrough.sourceJoinColumnName]:
          junctionCreateThrough.sourceRecordId,
        [junctionCreateThrough.targetJoinColumnName]: targetRecordId,
      });
    },
    [createOneRecord, junctionCreateThrough],
  );

  return { createJunctionRecord };
};
