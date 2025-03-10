import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

type UpdateActivityTargetFromInlineCellProps = {
  recordPickerInstanceId: string;
  morphItem: RecordPickerPickableMorphItem;
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

  const { upsertActivity } = useUpsertActivity({
    activityObjectNameSingular,
  });

  const setActivityFromStore = useSetRecoilState(
    recordStoreFamilyState(activityId),
  );

  const updateActivityTargetFromInlineCell = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        recordPickerInstanceId,
        morphItem,
      }: UpdateActivityTargetFromInlineCellProps) => {
        // eslint-disable-next-line no-console
        console.log(
          'updateActivityTargetFromInlineCell',
          recordPickerInstanceId,
        );
      },
    [],
  );

  // const { objectMetadataItem: objectMetadataItemActivityTarget } =
  //   useObjectMetadataItem({
  //     objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
  //   });

  // const [isActivityInCreateMode] = useRecoilState(isActivityInCreateModeState);

  // const handleSubmit = useRecoilCallback(
  //   ({ snapshot }) =>
  //     async () => {
  //       const pickableMorphItems = snapshot
  //         .getLoadable(multipleRecordPickerPickableMorphItemsState)
  //         .getValue();

  //       const activityTargetsAfterUpdate =
  //         activityTargetWithTargetRecords.filter((activityTarget) => {
  //           const pickableMorphItem = pickableMorphItems.find(
  //             (pickableMorphItem) =>
  //               pickableMorphItem.recordId === activityTarget.targetObject.id,
  //           );

  //           return pickableMorphItem ? pickableMorphItem.isSelected : true;
  //         });
  //       setActivityFromStore((currentActivity) => {
  //         if (isNull(currentActivity)) {
  //           return null;
  //         }

  //         return {
  //           ...currentActivity,
  //           activityTargets: activityTargetsAfterUpdate,
  //         };
  //       });
  //       closeEditableField();
  //     },
  //   [
  //     activityTargetWithTargetRecords,
  //     closeEditableField,
  //     multipleRecordPickerPickableMorphItemsState,
  //     setActivityFromStore,
  //   ],
  // );

  // const { createManyRecordsInCache: createManyActivityTargetsInCache } =
  //   useCreateManyRecordsInCache<NoteTarget | TaskTarget>({
  //     objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
  //   });

  // const multipleRecordPickerPickableMorphItemsState =
  //   useRecoilComponentCallbackStateV2(
  //     multipleRecordPickerPickableMorphItemsComponentState,
  //     recordPickerInstanceId,
  //   );

  // const activityTargetObjectRecordFamilyState =
  //   useRecoilComponentCallbackStateV2(
  //     activityTargetObjectRecordComponentFamilyState,
  //     recordPickerInstanceId,
  //   );

  // const activityTargetObjectRecordFamilyState =
  //   useRecoilComponentCallbackStateV2(
  //     activityTargetObjectRecordComponentFamilyState,
  //     recordPickerInstanceId,
  //   );

  // const updateActivityTargets = useRecoilCallback(
  //   ({ snapshot, set }) =>
  //     (newActivityTargets: ActivityTargetWithTargetRecord[]) => {
  //       for (const newActivityTarget of newActivityTargets) {
  //         const objectRecordId = newActivityTarget.targetObject.id;
  //         const record = snapshot
  //           .getLoadable(activityTargetObjectRecordFamilyState(objectRecordId))
  //           .getValue();

  //         if (
  //           !isDeeplyEqual(
  //             record.activityTargetId,
  //             newActivityTarget.activityTarget.id,
  //           )
  //         ) {
  //           set(activityTargetObjectRecordFamilyState(objectRecordId), {
  //             activityTargetId: newActivityTarget.activityTarget.id,
  //           });
  //         }
  //       }
  //     },
  //   [activityTargetObjectRecordFamilyState],
  // );

  // const handleChange = useRecoilCallback(
  //   ({ snapshot, set }) =>
  //     async (morphItem: RecordPickerPickableMorphItem) => {
  //       const { recordId } = morphItem;
  //       const existingActivityTargets = activityTargetWithTargetRecords.map(
  //         (activityTargetObjectRecord) =>
  //           activityTargetObjectRecord.activityTarget,
  //       );

  //       const pickableMorphItems = snapshot
  //         .getLoadable(multipleRecordPickerPickableMorphItemsState)
  //         .getValue();

  //       let activityTargetsAfterUpdate = Array.from(existingActivityTargets);

  //       const previouslyPickableMorphItems = snapshot
  //         .getLoadable(multipleRecordPickerPickableMorphItemsState)
  //         .getValue();

  //       const isNewlySelected = !previouslyPickableMorphItems.find(
  //         (pickableMorphItem) => pickableMorphItem.recordId === recordId,
  //       );

  //       if (isNewlySelected) {
  //         const pickableMorphItem = pickableMorphItems.find(
  //           (pickableMorphItem) => pickableMorphItem.recordId === recordId,
  //         );

  //         if (!pickableMorphItem) {
  //           throw new Error(
  //             `Could not find selected record with id ${recordId}`,
  //           );
  //         }

  //         // set(multipleRecordPickerPickableMorphItemsState, (prev) => [
  //         //   ...prev,
  //         //   pickableMorphItem,
  //         // ]);

  //         const objectMetadataItems = snapshot
  //           .getLoadable(objectMetadataItemsState)
  //           .getValue();

  //         const objectMetadataItem = objectMetadataItems.find(
  //           (objectMetadataItem) =>
  //             objectMetadataItem.id === pickableMorphItem.objectMetadataId,
  //         );

  //         if (!objectMetadataItem) {
  //           throw new Error('Could not find object metadata item');
  //         }
  //         const newActivityTargetId = v4();
  //         const fieldNameWithIdSuffix = getActivityTargetObjectFieldIdName({
  //           nameSingular: objectMetadataItem.nameSingular,
  //         });

  //         const newActivityTargetInput = {
  //           id: newActivityTargetId,
  //           ...(activityObjectNameSingular === CoreObjectNameSingular.Task
  //             ? { taskId: activity.id }
  //             : { noteId: activity.id }),
  //           [fieldNameWithIdSuffix]: recordId,
  //         };

  //         const newActivityTarget = prefillRecord<NoteTarget | TaskTarget>({
  //           objectMetadataItem: objectMetadataItemActivityTarget,
  //           input: newActivityTargetInput,
  //         });

  //         activityTargetsAfterUpdate.push(newActivityTarget);

  //         if (isActivityInCreateMode) {
  //           createManyActivityTargetsInCache([newActivityTarget]);
  //           upsertActivity({
  //             activity,
  //             input: {
  //               [activityObjectNameSingular === CoreObjectNameSingular.Task
  //                 ? 'taskTargets'
  //                 : activityObjectNameSingular === CoreObjectNameSingular.Note
  //                   ? 'noteTargets'
  //                   : '']: activityTargetsAfterUpdate,
  //             },
  //           });
  //         } else {
  //           await createOneActivityTarget(newActivityTargetInput);
  //         }

  //         set(activityTargetObjectRecordFamilyState(recordId), {
  //           activityTargetId: newActivityTargetId,
  //         });
  //       } else {
  //         const activityTargetToDeleteId = snapshot
  //           .getLoadable(activityTargetObjectRecordFamilyState(recordId))
  //           .getValue().activityTargetId;

  //         if (!activityTargetToDeleteId) {
  //           throw new Error('Could not delete this activity target.');
  //         }

  //         // set(multipleRecordPickerSelectedRecordsIdsFamilyState, (prev) =>
  //         //   prev.filter((id) => id !== recordId),
  //         // );
  //         activityTargetsAfterUpdate = activityTargetsAfterUpdate.filter(
  //           (activityTarget) => activityTarget.id !== activityTargetToDeleteId,
  //         );

  //         if (isActivityInCreateMode) {
  //           upsertActivity({
  //             activity,
  //             input: {
  //               [activityObjectNameSingular === CoreObjectNameSingular.Task
  //                 ? 'taskTargets'
  //                 : activityObjectNameSingular === CoreObjectNameSingular.Note
  //                   ? 'noteTargets'
  //                   : '']: activityTargetsAfterUpdate,
  //             },
  //           });
  //         } else {
  //           await deleteOneActivityTarget(activityTargetToDeleteId);
  //         }

  //         set(activityTargetObjectRecordFamilyState(recordId), {
  //           activityTargetId: null,
  //         });
  //       }
  //     },
  //   [
  //     activityTargetWithTargetRecords,
  //     multipleRecordPickerPickableMorphItemsState,
  //     activityObjectNameSingular,
  //     activity,
  //     objectMetadataItemActivityTarget,
  //     isActivityInCreateMode,
  //     activityTargetObjectRecordFamilyState,
  //     createManyActivityTargetsInCache,
  //     upsertActivity,
  //     createOneActivityTarget,
  //     deleteOneActivityTarget,
  //   ],
  // );

  return { updateActivityTargetFromInlineCell };
};
