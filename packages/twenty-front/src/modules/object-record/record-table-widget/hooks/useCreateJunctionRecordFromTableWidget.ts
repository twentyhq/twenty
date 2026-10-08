import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { type RecordTableWidgetJunctionCreateThrough } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useCallback } from 'react';

export const useCreateJunctionRecordFromTableWidget = ({
  junctionCreateThrough,
}: {
  junctionCreateThrough: RecordTableWidgetJunctionCreateThrough;
}) => {
  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular:
      junctionCreateThrough.junctionObjectMetadataNameSingular,
  });

  // Upsert keeps a pick idempotent when the record was linked meanwhile.
  const createJunctionRecord = useCallback(
    async (targetRecordId: string) => {
      await createManyRecords({
        recordsToCreate: [
          {
            [junctionCreateThrough.sourceJoinColumnName]:
              junctionCreateThrough.sourceRecordId,
            [junctionCreateThrough.targetJoinColumnName]: targetRecordId,
          },
        ],
        upsert: true,
      });
    },
    [createManyRecords, junctionCreateThrough],
  );

  return { createJunctionRecord };
};
