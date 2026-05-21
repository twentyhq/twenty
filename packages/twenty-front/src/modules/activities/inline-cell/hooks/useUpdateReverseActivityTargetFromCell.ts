import { useCallback } from 'react';
import { v4 } from 'uuid';

import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type UseUpdateReverseActivityTargetFromCellProps = {
  sourceObjectNameSingular:
    | CoreObjectNameSingular.Person
    | CoreObjectNameSingular.Company
    | CoreObjectNameSingular.Opportunity;
  sourceRecordId: string;
  fieldName: 'noteTargets' | 'taskTargets';
};

export const useUpdateReverseActivityTargetFromCell = ({
  sourceObjectNameSingular,
  sourceRecordId,
  fieldName,
}: UseUpdateReverseActivityTargetFromCellProps) => {
  const isNote = fieldName === 'noteTargets';

  const joinObjectNameSingular = isNote
    ? CoreObjectNameSingular.NoteTarget
    : CoreObjectNameSingular.TaskTarget;

  const activityIdFieldName = isNote ? 'noteId' : 'taskId';

  const sourceIdFieldName = getActivityTargetObjectFieldIdName({
    nameSingular: sourceObjectNameSingular,
  });

  const { createOneRecord: createJunctionRecord } = useCreateOneRecord<
    NoteTarget | TaskTarget
  >({
    objectNameSingular: joinObjectNameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const { deleteOneRecord: deleteJunctionRecord } = useDeleteOneRecord({
    objectNameSingular: joinObjectNameSingular,
  });

  const updateReverseActivityTarget = useCallback(
    async ({
      morphItem,
      junctionRecords,
    }: {
      morphItem: RecordPickerPickableMorphItem;
      junctionRecords: (NoteTarget | TaskTarget)[];
    }) => {
      const existingJunction = junctionRecords.find(
        (junction) =>
          (isNote
            ? (junction as NoteTarget).noteId
            : (junction as TaskTarget).taskId) === morphItem.recordId,
      );

      if (isDefined(existingJunction)) {
        if (!morphItem.isSelected) {
          await deleteJunctionRecord(existingJunction.id);
        }
      } else if (morphItem.isSelected) {
        await createJunctionRecord({
          id: v4(),
          [activityIdFieldName]: morphItem.recordId,
          [sourceIdFieldName]: sourceRecordId,
        } as Partial<NoteTarget | TaskTarget>);
      }
    },
    [
      isNote,
      activityIdFieldName,
      sourceIdFieldName,
      sourceRecordId,
      createJunctionRecord,
      deleteJunctionRecord,
    ],
  );

  return { updateReverseActivityTarget };
};
