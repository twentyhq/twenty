import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { searchRecordStoreComponentFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isNull } from '@sniptt/guards';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { v4 } from 'uuid';

type UpdateActivityTargetFromInlineCellProps = {
  recordPickerInstanceId: string;
  morphItem: RecordPickerPickableMorphItem;
  activityTargetWithTargetRecords: ActivityTargetWithTargetRecord[];
};

export const useUpdateActivityTargetFromInlineCell = ({
  activityObjectNameSingular,
  activityId,
}: {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  activityId: string;
}) => {
  const { createOneRecord: createOneActivityTarget } = useCreateOneRecord<
    NoteTarget | TaskTarget
  >({
    objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
  });

  const { deleteOneRecord: deleteOneActivityTarget } = useDeleteOneRecord({
    objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
  });

  const setActivityFromStore = useSetRecoilState(
    recordStoreFamilyState(activityId),
  );

  const updateActivityTargetFromInlineCell = useRecoilCallback(
    ({ snapshot }) =>
      async ({
        morphItem,
        activityTargetWithTargetRecords,
        recordPickerInstanceId,
      }: UpdateActivityTargetFromInlineCellProps) => {
        const targetObjectName =
          activityObjectNameSingular === CoreObjectNameSingular.Task
            ? 'task'
            : 'note';

        const pickedObjectMetadataItem = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue()
          .find(
            (objectMetadataItem) =>
              objectMetadataItem.id === morphItem.objectMetadataId,
          );

        if (!isDefined(pickedObjectMetadataItem)) {
          throw new Error('Could not find object metadata item');
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
            .getLoadable(
              searchRecordStoreComponentFamilyState.atomFamily({
                instanceId: recordPickerInstanceId,
                familyKey: morphItem.recordId,
              }),
            )
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
                  [pickedObjectMetadataItem.nameSingular]: targetRecord,
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
                  [pickedObjectMetadataItem.nameSingular]: targetRecord,
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
            [pickedObjectMetadataItem.nameSingular]: undefined,
            [`${pickedObjectMetadataItem.nameSingular}Id`]: morphItem.recordId,
          } as Partial<NoteTarget | TaskTarget>);
        }

        setActivityFromStore((currentActivity) => {
          if (isNull(currentActivity)) {
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

  return { updateActivityTargetFromInlineCell };
};
