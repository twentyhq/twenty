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

    const existingActivityTargets = activityTargetWithTargetRecords.map(
      (activityTargetObjectRecord) => activityTargetObjectRecord.activityTarget,
    );

    let activityTargetsAfterUpdate = Array.from(existingActivityTargets);

    const activityTargetsToCreate = selectedTargetObjectsToCreate.map(
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

    injectIntoActivityTargetInlineCellCache({
      activityId: activity.id,
      activityTargetsToInject: activityTargetsAfterUpdate,
    });

    if (isActivityInCreateMode) {
      upsertActivity({
        activity,
        input: {
          activityTargets: activityTargetsAfterUpdate,
        },
      });
    } else {
      if (activityTargetsToCreate.length > 0) {
        await createManyActivityTargets(activityTargetsToCreate, {
          skipOptimisticEffect: true,
        });
      }

      if (activityTargetsToDelete.length > 0) {
        await deleteManyActivityTargets(
          activityTargetsToDelete.map(
            (activityTargetObjectRecord) =>
              activityTargetObjectRecord.activityTarget.id,
          ),
          {
            skipOptimisticEffect: true,
          },
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
        selectedObjectRecordIds={selectedTargetObjectIds}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </StyledSelectContainer>
  );
};
