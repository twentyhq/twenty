import styled from '@emotion/styled';

import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { RecordChip } from '@/object-record/components/RecordChip';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const ActivityTargetChips = ({
  activityTargetObjectRecords,
}: {
  activityTargetObjectRecords: ActivityTargetWithTargetRecord[];
}) => {
  return (
    <StyledContainer>
      {activityTargetObjectRecords?.map((activityTargetObjectRecord) => (
        <RecordChip
          key={activityTargetObjectRecord.targetObject.id}
          record={activityTargetObjectRecord.targetObject}
          objectNameSingular={
            activityTargetObjectRecord.targetObjectMetadataItem.nameSingular
          }
        />
      ))}
    </StyledContainer>
  );
};
