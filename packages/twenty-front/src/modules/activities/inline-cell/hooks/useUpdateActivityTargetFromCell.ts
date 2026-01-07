import { type ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetFieldNameForObject } from '@/activities/utils/getActivityTargetFieldNameForObject';
import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type UpdateActivityTargetFromCellProps = {
  recordPickerInstanceId: string;
  morphItem: RecordPickerPickableMorphItem;
  activityTargetWithTargetRecords: ActivityTargetWithTargetRecord[];
};

// TODO: deprecate this hook once we implement one-to-many relation through
export const useUpdateActivityTargetFromCell = ({
  activityObjectNameSingular,
  activityId,
}: {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  activityId: string;
}) => {
  const joinObjectNameSingular = getJoinObjectNameSingular(
    activityObjectNameSingular,
  );

  const { createOneRecord: createOneActivityTarget } = useCreateOneRecord<
    NoteTarget | TaskTarget
  >({
    objectNameSingular:
      joinObjectNameSingular === ''
        ? activityObjectNameSingular
        : joinObjectNameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const { deleteOneRecord: deleteOneActivityTarget } = useDeleteOneRecord({
    objectNameSingular:
      joinObjectNameSingular === ''
        ? activityObjectNameSingular
        : joinObjectNameSingular,
  });

  const setActivityFromStore = useSetRecoilState(
    recordStoreFamilyState(activityId),
  );

  const updateActivityTargetFromCell = useRecoilCallback(
    ({ snapshot }) =>
      async ({
        morphItem,
        activityTargetWithTargetRecords,
      }: UpdateActivityTargetFromCellProps) => {
        const targetObjectName =
          activityObjectNameSingular === CoreObjectNameSingular.Task
            ? 'task'
            : 'note';

        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const pickedObjectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.id === morphItem.objectMetadataId,
        );

        if (!isDefined(pickedObjectMetadataItem)) {
          throw new Error('Could not find object metadata item');
        }

        const targetFieldName = getActivityTargetFieldNameForObject({
          activityObjectNameSingular,
          targetObjectMetadataId: morphItem.objectMetadataId,
          objectMetadataItems,
        });

        if (!isDefined(targetFieldName)) {
          throw new Error(
            `Could not find field on activity target for object ${pickedObjectMetadataItem.nameSingular}`,
          );
        }

        let activityTargetsAfterUpdate: (TaskTarget | NoteTarget)[] = [];

        const existingActivityTarget = activityTargetWithTargetRecords.find(
          (activityTarget) =>
            activityTarget.targetObject.id === morphItem.recordId,
        );

        if (isDefined(existingActivityTarget)) {
          activityTargetsAfterUpdate = activityTargetWithTargetRecords
            .map((activityTarget) => {
              if (
                activityTarget.targetObject.id === morphItem.recordId &&
                !morphItem.isSelected
              ) {
                return undefined;
              }

              return activityTarget.activityTarget;
            })
            .filter(isDefined);

          if (!morphItem.isSelected) {
            await deleteOneActivityTarget(
              existingActivityTarget.activityTarget.id,
            );
          }
        } else {
          const searchRecord = snapshot
            .getLoadable(searchRecordStoreFamilyState(morphItem.recordId))
            .getValue();

          if (!isDefined(searchRecord) || !isDefined(searchRecord?.record)) {
            return;
          }

          if (!morphItem.isSelected) {
            return;
          }

          const targetRecord = searchRecord.record;

          const activityTarget =
            activityObjectNameSingular === CoreObjectNameSingular.Task
              ? {
                  id: v4(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  __typename: 'TaskTarget',
                  taskId: activityId,
                  task: {
                    id: activityId,
                    __typename: 'Task',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  [targetFieldName]: targetRecord,
                }
              : {
                  id: v4(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  __typename: 'NoteTarget',
                  noteId: activityId,
                  note: {
                    id: activityId,
                    __typename: 'Note',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  [targetFieldName]: targetRecord,
                };

          activityTargetsAfterUpdate = [
            ...activityTargetWithTargetRecords.map((activityTarget) => {
              return activityTarget.activityTarget;
            }),
            activityTarget as NoteTarget | TaskTarget,
          ];

          await createOneActivityTarget({
            ...activityTarget,
            [targetObjectName]: undefined,
            [targetFieldName]: undefined,
            [`${targetFieldName}Id`]: morphItem.recordId,
          } as Partial<NoteTarget | TaskTarget>);
        }

        setActivityFromStore((currentActivity) => {
          if (!isDefined(currentActivity)) {
            return null;
          }

          return {
            ...currentActivity,
            [`${targetObjectName}Targets`]: activityTargetsAfterUpdate,
          };
        });
      },
    [
      activityId,
      activityObjectNameSingular,
      createOneActivityTarget,
      deleteOneActivityTarget,
      setActivityFromStore,
    ],
  );

  return { updateActivityTargetFromCell };
};
