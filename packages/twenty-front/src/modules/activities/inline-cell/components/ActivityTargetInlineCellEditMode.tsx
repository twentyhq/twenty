import styled from '@emotion/styled';
import { isNonEmptyArray, isNull } from '@sniptt/guards';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { getActivityTargetObjectFieldName } from '@/activities/utils/getActivityTargetObjectFieldName';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecordsInCache } from '@/object-record/cache/hooks/useCreateManyRecordsInCache';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { MultipleObjectRecordSelect } from '@/object-record/relation-picker/components/MultipleObjectRecordSelect';
import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { prefillRecord } from '@/object-record/utils/prefillRecord';

const StyledSelectContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
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
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const setActivityFromStore = useSetRecoilState(
    recordStoreFamilyState(activity.id),
  );

  const { createManyRecordsInCache: createManyActivityTargetsInCache } =
    useCreateManyRecordsInCache<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const handleSubmit = async (selectedRecords: ObjectRecordForSelect[]) => {
    closeEditableField();

    const activityTargetsToDelete = activityTargetWithTargetRecords.filter(
      (activityTargetObjectRecord) =>
        !selectedRecords.some(
          (selectedRecord) =>
            selectedRecord.recordIdentifier.id ===
            activityTargetObjectRecord.targetObject.id,
        ),
    );

    const selectedTargetObjectsToCreate = selectedRecords.filter(
      (selectedRecord) =>
        !activityTargetWithTargetRecords.some(
          (activityTargetWithTargetRecord) =>
            activityTargetWithTargetRecord.targetObject.id ===
            selectedRecord.recordIdentifier.id,
        ),
    );

    const existingActivityTargets = activityTargetWithTargetRecords.map(
      (activityTargetObjectRecord) => activityTargetObjectRecord.activityTarget,
    );

    let activityTargetsAfterUpdate = Array.from(existingActivityTargets);

    const activityTargetsToCreate = selectedTargetObjectsToCreate.map(
      (selectedRecord) => {
        const emptyActivityTarget = prefillRecord<ActivityTarget>({
          objectMetadataItem: objectMetadataItemActivityTarget,
          input: {
            id: v4(),
            activityId: activity.id,
            activity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            [getActivityTargetObjectFieldName({
              nameSingular: selectedRecord.objectMetadataItem.nameSingular,
            })]: selectedRecord.record,
            [getActivityTargetObjectFieldIdName({
              nameSingular: selectedRecord.objectMetadataItem.nameSingular,
            })]: selectedRecord.recordIdentifier.id,
          },
        });

        return emptyActivityTarget;
      },
    );

    activityTargetsAfterUpdate.push(...activityTargetsToCreate);

    if (isNonEmptyArray(activityTargetsToDelete)) {
      activityTargetsAfterUpdate = activityTargetsAfterUpdate.filter(
        (activityTarget) =>
          !activityTargetsToDelete.some(
            (activityTargetToDelete) =>
              activityTargetToDelete.activityTarget.id === activityTarget.id,
          ),
      );
    }

    if (isActivityInCreateMode) {
      createManyActivityTargetsInCache(activityTargetsToCreate);
      upsertActivity({
        activity,
        input: {
          activityTargets: activityTargetsAfterUpdate,
        },
      });
    } else {
      if (activityTargetsToCreate.length > 0) {
        await createManyActivityTargets(activityTargetsToCreate);
      }

      if (activityTargetsToDelete.length > 0) {
        await deleteManyActivityTargets(
          activityTargetsToDelete.map(
            (activityTargetObjectRecord) =>
              activityTargetObjectRecord.activityTarget.id,
          ),
        );
      }
    }

    setActivityFromStore((currentActivity) => {
      if (isNull(currentActivity)) {
        return null;
      }

      return {
        ...currentActivity,
        activityTargets: activityTargetsAfterUpdate,
      };
    });
  };

  const handleCancel = () => {
    closeEditableField();
  };

  return (
    <StyledSelectContainer>
      <MultipleObjectRecordSelect
        selectedObjectRecordIds={selectedTargetObjectIds}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </StyledSelectContainer>
  );
};
