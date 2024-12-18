import { isNull } from '@sniptt/guards';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { ActivityTargetObjectRecordEffect } from '@/activities/inline-cell/components/ActivityTargetObjectRecordEffect';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { Note } from '@/activities/types/Note';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { Task } from '@/activities/types/Task';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecordsInCache } from '@/object-record/cache/hooks/useCreateManyRecordsInCache';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { activityTargetObjectRecordFamilyState } from '@/object-record/record-field/states/activityTargetObjectRecordFamilyState';
import { objectRecordMultiSelectCheckedRecordsIdsComponentState } from '@/object-record/record-field/states/objectRecordMultiSelectCheckedRecordsIdsComponentState';
import {
  ObjectRecordAndSelected,
  objectRecordMultiSelectComponentFamilyState,
} from '@/object-record/record-field/states/objectRecordMultiSelectComponentFamilyState';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ActivityTargetInlineCellEditModeMultiRecordsEffect } from '@/object-record/relation-picker/components/ActivityTargetInlineCellEditModeMultiRecordsEffect';
import { ActivityTargetInlineCellEditModeMultiRecordsSearchFilterEffect } from '@/object-record/relation-picker/components/ActivityTargetInlineCellEditModeMultiRecordsSearchFilterEffect';
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { prefillRecord } from '@/object-record/utils/prefillRecord';

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

  const selectedTargetObjectIds = activityTargetWithTargetRecords.map(
    (activityTarget) => ({
      objectNameSingular: activityTarget.targetObjectMetadataItem.nameSingular,
      id: activityTarget.targetObject.id,
    }),
  );

  const { createManyRecords: createManyActivityTargets } = useCreateManyRecords<
    NoteTarget | TaskTarget
  >({
    objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
  });

  const { deleteManyRecords: deleteManyActivityTargets } = useDeleteManyRecords(
    {
      objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
    },
  );

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

  const handleSubmit = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const activityTargetsAfterUpdate =
          activityTargetWithTargetRecords.filter((activityTarget) => {
            const recordSelectedInMultiSelect = snapshot
              .getLoadable(
                objectRecordMultiSelectComponentFamilyState({
                  scopeId: recordPickerInstanceId,
                  familyKey: activityTarget.targetObject.id,
                }),
              )
              .getValue() as ObjectRecordAndSelected;

            return recordSelectedInMultiSelect
              ? recordSelectedInMultiSelect.selected
              : true;
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
      recordPickerInstanceId,
      setActivityFromStore,
    ],
  );

  const handleChange = useRecoilCallback(
    ({ snapshot, set }) =>
      async (recordId: string) => {
        const existingActivityTargets = activityTargetWithTargetRecords.map(
          (activityTargetObjectRecord) =>
            activityTargetObjectRecord.activityTarget,
        );

        let activityTargetsAfterUpdate = Array.from(existingActivityTargets);

        const previouslyCheckedRecordsIds = snapshot
          .getLoadable(
            objectRecordMultiSelectCheckedRecordsIdsComponentState({
              scopeId: recordPickerInstanceId,
            }),
          )
          .getValue();

        const isNewlySelected = !previouslyCheckedRecordsIds.includes(recordId);

        if (isNewlySelected) {
          const record = snapshot
            .getLoadable(
              objectRecordMultiSelectComponentFamilyState({
                scopeId: recordPickerInstanceId,
                familyKey: recordId,
              }),
            )
            .getValue();

          if (!record) {
            throw new Error(
              `Could not find selected record with id ${recordId}`,
            );
          }

          set(
            objectRecordMultiSelectCheckedRecordsIdsComponentState({
              scopeId: recordPickerInstanceId,
            }),
            (prev) => [...prev, recordId],
          );

          const newActivityTargetId = v4();
          const fieldName = record.objectMetadataItem.nameSingular;
          const fieldNameWithIdSuffix = getActivityTargetObjectFieldIdName({
            nameSingular: record.objectMetadataItem.nameSingular,
          });

          const newActivityTarget = prefillRecord<NoteTarget | TaskTarget>({
            objectMetadataItem: objectMetadataItemActivityTarget,
            input: {
              id: newActivityTargetId,
              taskId:
                activityObjectNameSingular === CoreObjectNameSingular.Task
                  ? activity.id
                  : null,
              task:
                activityObjectNameSingular === CoreObjectNameSingular.Task
                  ? activity
                  : null,
              noteId:
                activityObjectNameSingular === CoreObjectNameSingular.Note
                  ? activity.id
                  : null,
              note:
                activityObjectNameSingular === CoreObjectNameSingular.Note
                  ? activity
                  : null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              [fieldName]: record.record,
              [fieldNameWithIdSuffix]: recordId,
            },
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
            await createManyActivityTargets([newActivityTarget]);
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

          set(
            objectRecordMultiSelectCheckedRecordsIdsComponentState({
              scopeId: recordPickerInstanceId,
            }),
            previouslyCheckedRecordsIds.filter((id) => id !== recordId),
          );
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
            await deleteManyActivityTargets([activityTargetToDeleteId]);
          }

          set(activityTargetObjectRecordFamilyState(recordId), {
            activityTargetId: null,
          });
        }
      },
    [
      activity,
      activityTargetWithTargetRecords,
      createManyActivityTargets,
      createManyActivityTargetsInCache,
      deleteManyActivityTargets,
      isActivityInCreateMode,
      objectMetadataItemActivityTarget,
      recordPickerInstanceId,
      upsertActivity,
      activityObjectNameSingular,
    ],
  );

  return (
    <>
      <RecordPickerComponentInstanceContext.Provider
        value={{ instanceId: recordPickerInstanceId }}
      >
        <ActivityTargetObjectRecordEffect
          activityTargetWithTargetRecords={activityTargetWithTargetRecords}
        />
        <ActivityTargetInlineCellEditModeMultiRecordsEffect
          selectedObjectRecordIds={selectedTargetObjectIds}
        />
        <ActivityTargetInlineCellEditModeMultiRecordsSearchFilterEffect />
        <MultiRecordSelect onSubmit={handleSubmit} onChange={handleChange} />
      </RecordPickerComponentInstanceContext.Provider>
    </>
  );
};
