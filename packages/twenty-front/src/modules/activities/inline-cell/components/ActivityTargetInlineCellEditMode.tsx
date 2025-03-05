import { isNull } from '@sniptt/guards';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { activityTargetObjectRecordComponentFamilyState } from '@/activities/inline-cell/states/activityTargetObjectRecordComponentFamilyState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { Note } from '@/activities/types/Note';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { Task } from '@/activities/types/Task';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecordsInCache } from '@/object-record/cache/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { prefillRecord } from '@/object-record/utils/prefillRecord';
import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useEffect } from 'react';

type ActivityTargetInlineCellEditModeProps = {
  activity: Task | Note;
  activityTargetWithTargetRecords: ActivityTargetWithTargetRecord[];
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
};

export const ActivityTargetInlineCellEditMode = ({
  activity,
  activityTargetWithTargetRecords,
  activityObjectNameSingular,
}: ActivityTargetInlineCellEditModeProps) => {
  const [isActivityInCreateMode] = useRecoilState(isActivityInCreateModeState);
  const recordPickerInstanceId = `record-picker-${activity.id}`;

  // const selectedTargetObjectIds = activityTargetWithTargetRecords.map(
  //   (activityTarget) => ({
  //     objectNameSingular: activityTarget.targetObjectMetadataItem.nameSingular,
  //     id: activityTarget.targetObject.id,
  //   }),
  // );

  const { createOneRecord: createOneActivityTarget } = useCreateOneRecord<
    NoteTarget | TaskTarget
  >({
    objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
  });

  const { deleteOneRecord: deleteOneActivityTarget } = useDeleteOneRecord({
    objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
  });

  const { closeInlineCell: closeEditableField } = useInlineCell();

  const { upsertActivity } = useUpsertActivity({
    activityObjectNameSingular,
  });

  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItem({
      objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
    });

  const setActivityFromStore = useSetRecoilState(
    recordStoreFamilyState(activity.id),
  );

  const { createManyRecordsInCache: createManyActivityTargetsInCache } =
    useCreateManyRecordsInCache<NoteTarget | TaskTarget>({
      objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
    });

  const multipleRecordPickerPickableMorphItemsState =
    useRecoilComponentCallbackStateV2(
      multipleRecordPickerPickableMorphItemsComponentState,
      recordPickerInstanceId,
    );

  const handleSubmit = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const pickableMorphItems = snapshot
          .getLoadable(multipleRecordPickerPickableMorphItemsState)
          .getValue();

        const activityTargetsAfterUpdate =
          activityTargetWithTargetRecords.filter((activityTarget) => {
            const pickableMorphItem = pickableMorphItems.find(
              (pickableMorphItem) =>
                pickableMorphItem.recordId === activityTarget.targetObject.id,
            );

            return pickableMorphItem ? pickableMorphItem.isSelected : true;
          });
        setActivityFromStore((currentActivity) => {
          if (isNull(currentActivity)) {
            return null;
          }

          return {
            ...currentActivity,
            activityTargets: activityTargetsAfterUpdate,
          };
        });
        closeEditableField();
      },
    [
      activityTargetWithTargetRecords,
      closeEditableField,
      multipleRecordPickerPickableMorphItemsState,
      setActivityFromStore,
    ],
  );

  const activityTargetObjectRecordFamilyState =
    useRecoilComponentCallbackStateV2(
      activityTargetObjectRecordComponentFamilyState,
      recordPickerInstanceId,
    );

  const handleChange = useRecoilCallback(
    ({ snapshot, set }) =>
      async (recordId: string) => {
        const existingActivityTargets = activityTargetWithTargetRecords.map(
          (activityTargetObjectRecord) =>
            activityTargetObjectRecord.activityTarget,
        );

        const pickableMorphItems = snapshot
          .getLoadable(multipleRecordPickerPickableMorphItemsState)
          .getValue();

        let activityTargetsAfterUpdate = Array.from(existingActivityTargets);

        const previouslyPickableMorphItems = snapshot
          .getLoadable(multipleRecordPickerPickableMorphItemsState)
          .getValue();

        const isNewlySelected = !previouslyPickableMorphItems.find(
          (pickableMorphItem) => pickableMorphItem.recordId === recordId,
        );

        if (isNewlySelected) {
          const pickableMorphItem = pickableMorphItems.find(
            (pickableMorphItem) => pickableMorphItem.recordId === recordId,
          );

          if (!pickableMorphItem) {
            throw new Error(
              `Could not find selected record with id ${recordId}`,
            );
          }

          // set(multipleRecordPickerPickableMorphItemsState, (prev) => [
          //   ...prev,
          //   pickableMorphItem,
          // ]);

          const objectMetadataItems = snapshot
            .getLoadable(objectMetadataItemsState)
            .getValue();

          const objectMetadataItem = objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.id === pickableMorphItem.objectMetadataId,
          );

          if (!objectMetadataItem) {
            throw new Error('Could not find object metadata item');
          }
          const newActivityTargetId = v4();
          const fieldNameWithIdSuffix = getActivityTargetObjectFieldIdName({
            nameSingular: objectMetadataItem.nameSingular,
          });

          const newActivityTargetInput = {
            id: newActivityTargetId,
            ...(activityObjectNameSingular === CoreObjectNameSingular.Task
              ? { taskId: activity.id }
              : { noteId: activity.id }),
            [fieldNameWithIdSuffix]: recordId,
          };

          const newActivityTarget = prefillRecord<NoteTarget | TaskTarget>({
            objectMetadataItem: objectMetadataItemActivityTarget,
            input: newActivityTargetInput,
          });

          activityTargetsAfterUpdate.push(newActivityTarget);

          if (isActivityInCreateMode) {
            createManyActivityTargetsInCache([newActivityTarget]);
            upsertActivity({
              activity,
              input: {
                [activityObjectNameSingular === CoreObjectNameSingular.Task
                  ? 'taskTargets'
                  : activityObjectNameSingular === CoreObjectNameSingular.Note
                    ? 'noteTargets'
                    : '']: activityTargetsAfterUpdate,
              },
            });
          } else {
            await createOneActivityTarget(newActivityTargetInput);
          }

          set(activityTargetObjectRecordFamilyState(recordId), {
            activityTargetId: newActivityTargetId,
          });
        } else {
          const activityTargetToDeleteId = snapshot
            .getLoadable(activityTargetObjectRecordFamilyState(recordId))
            .getValue().activityTargetId;

          if (!activityTargetToDeleteId) {
            throw new Error('Could not delete this activity target.');
          }

          // set(multipleRecordPickerSelectedRecordsIdsFamilyState, (prev) =>
          //   prev.filter((id) => id !== recordId),
          // );
          activityTargetsAfterUpdate = activityTargetsAfterUpdate.filter(
            (activityTarget) => activityTarget.id !== activityTargetToDeleteId,
          );

          if (isActivityInCreateMode) {
            upsertActivity({
              activity,
              input: {
                [activityObjectNameSingular === CoreObjectNameSingular.Task
                  ? 'taskTargets'
                  : activityObjectNameSingular === CoreObjectNameSingular.Note
                    ? 'noteTargets'
                    : '']: activityTargetsAfterUpdate,
              },
            });
          } else {
            await deleteOneActivityTarget(activityTargetToDeleteId);
          }

          set(activityTargetObjectRecordFamilyState(recordId), {
            activityTargetId: null,
          });
        }
      },
    [
      activityTargetWithTargetRecords,
      multipleRecordPickerPickableMorphItemsState,
      activityObjectNameSingular,
      activity,
      objectMetadataItemActivityTarget,
      isActivityInCreateMode,
      activityTargetObjectRecordFamilyState,
      createManyActivityTargetsInCache,
      upsertActivity,
      createOneActivityTarget,
      deleteOneActivityTarget,
    ],
  );

  const { toggleClickOutsideListener: toggleRightDrawerClickOustideListener } =
    useClickOutsideListener(RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID);

  useEffect(() => {
    toggleRightDrawerClickOustideListener(false);

    return () => {
      toggleRightDrawerClickOustideListener(true);
    };
  }, [toggleRightDrawerClickOustideListener]);

  return (
    <>
      {/* <ActivityTargetObjectRecordEffect
        activityTargetWithTargetRecords={activityTargetWithTargetRecords}
        recordPickerInstanceId={recordPickerInstanceId}
      />
      <ActivityTargetInlineCellEditModeMultiRecordsEffect
        recordPickerInstanceId={recordPickerInstanceId}
        selectedObjectRecordIds={selectedTargetObjectIds}
      /> */}
      <MultipleRecordPicker
        componentInstanceId={recordPickerInstanceId}
        onClickOutside={handleSubmit}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
    </>
  );
};
