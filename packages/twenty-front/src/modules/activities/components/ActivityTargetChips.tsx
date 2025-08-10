import styled from '@emotion/styled';

import { type ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { RecordChip } from '@/object-record/components/RecordChip';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

type ActivityTargetChipsProps = {
  activityTargetObjectRecords: ActivityTargetWithTargetRecord[];
  maxWidth?: number;
};

const StyledContainer = styled.div<{ maxWidth?: number }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : 'none')};
`;

export const ActivityTargetChips = ({
  activityTargetObjectRecords,
  maxWidth,
}: ActivityTargetChipsProps) => {
  return (
    <StyledContainer maxWidth={maxWidth}>
      <ExpandableList isChipCountDisplayed>
        {activityTargetObjectRecords.map(
          (activityTargetObjectRecord, index) => (
            <RecordChip
              key={index}
              record={activityTargetObjectRecord.targetObject}
              objectNameSingular={
                activityTargetObjectRecord.targetObjectMetadataItem.nameSingular
              }
            />
          ),
        )}
      </ExpandableList>
    </StyledContainer>
  );
};
