import styled from '@emotion/styled';

import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { RecordChip } from '@/object-record/components/RecordChip';
import {
  ExpandableList,
  ExpandableListProps,
} from '@/ui/layout/expandable-list/components/ExpandableList';

const StyledContainer = styled.div<{ maxWidth?: number }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  max-width: ${({ maxWidth }) => `${maxWidth}px` || 'none'};
`;

export const ActivityTargetChips = ({
  activityTargetObjectRecords,
  isHovered,
  reference,
  maxWidth,
}: {
  activityTargetObjectRecords: ActivityTargetWithTargetRecord[];
  maxWidth?: number;
} & ExpandableListProps) => {
  return (
    <StyledContainer maxWidth={maxWidth}>
      <ExpandableList
        isHovered={isHovered}
        reference={reference}
        forceDisplayHiddenCount
      >
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
