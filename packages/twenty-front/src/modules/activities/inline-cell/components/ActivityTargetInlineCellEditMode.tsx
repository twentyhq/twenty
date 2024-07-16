import styled from '@emotion/styled';
import { isNull } from '@sniptt/guards';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { ActivityTargetObjectRecordEffect } from '@/activities/inline-cell/components/ActivityTargetObjectRecordEffect';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { getActivityTargetObjectFieldName } from '@/activities/utils/getActivityTargetObjectFieldName';
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
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';
import { prefillRecord } from '@/object-record/utils/prefillRecord';

const StyledSelectContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
`;

type ActivityTargetInlineCellEditModeProps = {
  activity: Activity;
  activityTargetWithTargetRecords: ActivityTargetWithTargetRecord[];
};

export const ActivityTargetInlineCellEditMode = ({
  activity,
  activityTargetWithTargetRecords,
}: ActivityTargetInlineCellEditModeProps) => {
  const [isActivityInCreateMode] = useRecoilState(isActivityInCreateModeState);
  const relationPickerScopeId = `relation-picker-${activity.id}`;

  const selectedTargetObjectIds = activityTargetWithTargetRecords.map(
    (activityTarget) => ({
      objectNameSingular: activityTarget.targetObjectMetadataItem.nameSingular,
      id: activityTarget.targetObject.id,
    }),
  );

  const { createManyRecords: createManyActivityTargets } =
    useCreateManyRecords<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const { deleteManyRecords: deleteManyActivityTargets } = useDeleteManyRecords(
    {
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    },
  );

  const { closeInlineCell: closeEditableField } = useInlineCell();

  const { upsertActivity } = useUpsertActivity();

  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const setActivityFromStore = useSetRecoilState(
    recordStoreFamilyState(activity.id),
  );

  const { createManyRecordsInCache: createManyActivityTargetsInCache } =
    useCreateManyRecordsInCache<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const handleSubmit = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const activityTargetsAfterUpdate =
          activityTargetWithTargetRecords.filter((activityTarget) => {
            const record = snapshot
              .getLoadable(
                objectRecordMultiSelectComponentFamilyState({
                  scopeId: relationPickerScopeId,
                  familyKey: activityTarget.targetObject.id,
                }),
              )
              .getValue() as ObjectRecordAndSelected;

            return record.selected;
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
      relationPickerScopeId,
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
              scopeId: relationPickerScopeId,
            }),
          )
          .getValue();

        const isNewlySelected = !previouslyCheckedRecordsIds.includes(recordId);

        if (isNewlySelected) {
          const record = snapshot
            .getLoadable(
              objectRecordMultiSelectComponentFamilyState({
                scopeId: relationPickerScopeId,
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
              scopeId: relationPickerScopeId,
            }),
            (prev) => [...prev, recordId],
          );

          const newActivityTargetId = v4();
          const fieldName = getActivityTargetObjectFieldName({
            nameSingular: record.objectMetadataItem.nameSingular,
          });
          const fieldNameWithIdSuffix = getActivityTargetObjectFieldIdName({
            nameSingular: record.objectMetadataItem.nameSingular,
          });
          const newActivityTarget = prefillRecord<ActivityTarget>({
            objectMetadataItem: objectMetadataItemActivityTarget,
            input: {
              id: newActivityTargetId,
              activityId: activity.id,
              activity,
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
                activityTargets: activityTargetsAfterUpdate,
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
              scopeId: relationPickerScopeId,
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
                activityTargets: activityTargetsAfterUpdate,
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
      relationPickerScopeId,
      upsertActivity,
    ],
  );

  return (
    <StyledSelectContainer>
      <RelationPickerScope relationPickerScopeId={relationPickerScopeId}>
        <ActivityTargetObjectRecordEffect
          activityTargetWithTargetRecords={activityTargetWithTargetRecords}
        />
        <ActivityTargetInlineCellEditModeMultiRecordsEffect
          selectedObjectRecordIds={selectedTargetObjectIds}
        />
        <MultiRecordSelect onSubmit={handleSubmit} onChange={handleChange} />
      </RelationPickerScope>
    </StyledSelectContainer>
  );
};
