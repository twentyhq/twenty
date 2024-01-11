import styled from '@emotion/styled';

import { ActivityTargetObjectRecord } from '@/activities/types/ActivityTargetObject';
import { RecordChip } from '@/object-record/components/RecordChip';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const ActivityTargetChips = ({
  activityTargetObjectRecords,
}: {
  activityTargetObjectRecords: ActivityTargetObjectRecord[];
}) => {
  return (
    <StyledContainer>
      {activityTargetObjectRecords?.map((activityTargetObjectRecord) => (
        <RecordChip
          key={activityTargetObjectRecord.targetObjectRecord.id}
          record={activityTargetObjectRecord.targetObjectRecord}
          objectNameSingular={
            activityTargetObjectRecord.targetObjectMetadataItem.nameSingular
          }
        />
      ))}
    </StyledContainer>
  );
};
