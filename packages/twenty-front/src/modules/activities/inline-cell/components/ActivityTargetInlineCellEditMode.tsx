import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { useInjectIntoActivityTargetInlineCellCache } from '@/activities/inline-cell/hooks/useInjectIntoActivityTargetInlineCellCache';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
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
  activityTargetWithTargetRecords: ActivityTargetWithTargetRecord[];
};

export const ActivityTargetInlineCellEditMode = ({
  activity,
  activityTargetWithTargetRecords,
}: ActivityTargetInlineCellEditModeProps) => {
  const [isActivityInCreateMode] = useRecoilState(isActivityInCreateModeState);

  const selectedTargetObjectIds = activityTargetWithTargetRecords.map(
    (activityTarget) => ({
      objectNameSingular: activityTarget.targetObjectNameSingular,
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

  const { injectIntoActivityTargetInlineCellCache } =
    useInjectIntoActivityTargetInlineCellCache();

  const { generateObjectRecordOptimisticResponse } =
    useGenerateObjectRecordOptimisticResponse({
      objectMetadataItem: objectMetadataItemActivityTarget,
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

    if (isActivityInCreateMode) {
      let existingActivityTargets = activity.activityTargets;

      if (isNonEmptyArray(existingActivityTargets)) {
        const generatedActivityTargets = selectedTargetObjectsToCreate.map(
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

        existingActivityTargets.push(...generatedActivityTargets);
      }

      if (isNonEmptyArray(activityTargetsToDelete)) {
        existingActivityTargets = existingActivityTargets.filter(
          (activityTarget) =>
            !activityTargetsToDelete.some(
              (activityTargetObjectRecord) =>
                activityTargetObjectRecord.targetObject.id ===
                activityTarget.id,
            ),
        );
      }

      injectIntoActivityTargetInlineCellCache({
        activityId: activity.id,
        activityTargetsToInject: existingActivityTargets,
      });

      upsertActivity({
        activity,
        input: {
          activityTargets: existingActivityTargets,
        },
      });
    } else {
      const activityTargetsToCreate = selectedTargetObjectsToCreate.map(
        (selectedRecord) =>
          ({
            id: v4(),
            activityId: activity.id,
            [getActivityTargetObjectFieldIdName({
              nameSingular: selectedRecord.objectMetadataItem.nameSingular,
            })]: selectedRecord.recordIdentifier.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            activity,
          }) as ActivityTarget,
      );

      if (selectedTargetObjectsToCreate.length > 0) {
        const activityTargetsToCreate = selectedTargetObjectsToCreate.map(
          (selectedRecord) =>
            ({
              id: v4(),
              activityId: activity.id,
              [getActivityTargetObjectFieldIdName({
                nameSingular: selectedRecord.objectMetadataItem.nameSingular,
              })]: selectedRecord.recordIdentifier.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              activity,
            }) as ActivityTarget,
        );

        await createManyActivityTargets(activityTargetsToCreate, {
          skipOptimisticEffect: true,
        });

        injectIntoActivityTargetInlineCellCache({
          activityId: activity.id,
          activityTargetsToInject: activityTargetsToCreate,
        });
      }

      if (activityTargetsToDelete.length > 0) {
        await deleteManyActivityTargets(
          activityTargetsToDelete.map(
            (activityTargetObjectRecord) =>
              activityTargetObjectRecord.activityTarget.id,
          ),
        );
      }

      injectIntoActivityTargetInlineCellCache({
        activityId: activity.id,
        activityTargetsToInject: activityTargetsToCreate,
      });
    }
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
