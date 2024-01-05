import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetObjectRecord } from '@/activities/types/ActivityTargetObject';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
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
  activityId: string;
  activityTargetObjectRecords: ActivityTargetObjectRecord[];
};

export const ActivityTargetInlineCellEditMode = ({
  activityId,
  activityTargetObjectRecords,
}: ActivityTargetInlineCellEditModeProps) => {
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

    if (activityTargetRecordsToCreate.length > 0) {
      await createManyActivityTargets(
        activityTargetRecordsToCreate.map((selectedRecord) => ({
          id: v4(),
          activityId,
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
