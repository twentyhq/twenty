import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { useInjectIntoActivityTargetInlineCellCache } from '@/activities/inline-cell/hooks/useInjectIntoActivityTargetInlineCellCache';
import { isCreatingActivityState } from '@/activities/states/isCreatingActivityState';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetObjectRecord } from '@/activities/types/ActivityTargetObject';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { MultipleObjectRecordSelect } from '@/object-record/relation-picker/components/MultipleObjectRecordSelect';
import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';

const StyledSelectContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

type ActivityTargetInlineCellEditModeProps = {
  activity: Activity;
  activityTargetObjectRecords: ActivityTargetObjectRecord[];
};

export const ActivityTargetInlineCellEditMode = ({
  activity,
  activityTargetObjectRecords,
}: ActivityTargetInlineCellEditModeProps) => {
  const [isCreatingActivity] = useRecoilState(isCreatingActivityState);

  const selectedObjectRecordIds = activityTargetObjectRecords.map(
    (activityTarget) => ({
      objectNameSingular: activityTarget.targetObjectNameSingular,
      id: activityTarget.targetObjectRecord.id,
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

  const { injectIntoActivityTargetInlineCellCache } =
    useInjectIntoActivityTargetInlineCellCache();

  const { generateObjectRecordOptimisticResponse } =
    useGenerateObjectRecordOptimisticResponse({
      objectMetadataItem: objectMetadataItemActivityTarget,
    });

  const handleSubmit = async (selectedRecords: ObjectRecordForSelect[]) => {
    closeEditableField();
    const activityTargetRecordsToDelete = activityTargetObjectRecords.filter(
      (activityTargetObjectRecord) =>
        !selectedRecords.some(
          (selectedRecord) =>
            selectedRecord.recordIdentifier.id ===
            activityTargetObjectRecord.targetObjectRecord.id,
        ),
    );

    const activityTargetRecordsToCreate = selectedRecords.filter(
      (selectedRecord) =>
        !activityTargetObjectRecords.some(
          (activityTargetObjectRecord) =>
            activityTargetObjectRecord.targetObjectRecord.id ===
            selectedRecord.recordIdentifier.id,
        ),
    );

    if (isCreatingActivity) {
      let activityTargetsForCreation = activity.activityTargets;

      if (isNonEmptyArray(activityTargetsForCreation)) {
        const generatedActivityTargets = activityTargetRecordsToCreate.map(
          (selectedRecord) => {
            const emptyActivityTarget =
              generateObjectRecordOptimisticResponse<ActivityTarget>({
                id: v4(),
                activityId: activity.id,
                activity,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                [getActivityTargetObjectFieldIdName({
                  nameSingular: selectedRecord.objectMetadataItem.nameSingular,
                })]: selectedRecord.recordIdentifier.id,
              });

            return emptyActivityTarget;
          },
        );

        activityTargetsForCreation.push(...generatedActivityTargets);
      }

      if (isNonEmptyArray(activityTargetRecordsToDelete)) {
        activityTargetsForCreation = activityTargetsForCreation.filter(
          (activityTarget) =>
            !activityTargetRecordsToDelete.some(
              (activityTargetObjectRecord) =>
                activityTargetObjectRecord.targetObjectRecord.id ===
                activityTarget.id,
            ),
        );
      }

      injectIntoActivityTargetInlineCellCache({
        activityId: activity.id,
        activityTargetsToInject: activityTargetsForCreation,
      });

      upsertActivity({
        activity,
        input: {
          activityTargets: activityTargetsForCreation,
        },
      });
    } else {
      if (activityTargetRecordsToCreate.length > 0) {
        await createManyActivityTargets(
          activityTargetRecordsToCreate.map((selectedRecord) => ({
            id: v4(),
            activityId: activity.id,
            [getActivityTargetObjectFieldIdName({
              nameSingular: selectedRecord.objectMetadataItem.nameSingular,
            })]: selectedRecord.recordIdentifier.id,
          })),
        );
      }

      if (activityTargetRecordsToDelete.length > 0) {
        await deleteManyActivityTargets(
          activityTargetRecordsToDelete.map(
            (activityTargetObjectRecord) =>
              activityTargetObjectRecord.activityTargetRecord.id,
          ),
        );
      }
    }
  };

  const handleCancel = () => {
    closeEditableField();
  };

  return (
    <StyledSelectContainer>
      <MultipleObjectRecordSelect
        selectedObjectRecordIds={selectedObjectRecordIds}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </StyledSelectContainer>
  );
};
