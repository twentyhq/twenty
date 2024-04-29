import styled from '@emotion/styled';

import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { RecordChip } from '@/object-record/components/RecordChip';
import {
  ExpandableList,
  ExpandableListProps,
} from '@/object-record/record-field/meta-types/display/components/ExpandableList.tsx';

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
  forceDisplayHiddenCount,
}: {
  activityTargetObjectRecords: ActivityTargetWithTargetRecord[];
  maxWidth?: number;
  forceDisplayHiddenCount?: boolean;
} & ExpandableListProps) => {
  return (
    <StyledContainer maxWidth={maxWidth}>
      <ExpandableList
        isHovered={isHovered}
        reference={reference}
        forceDisplayHiddenCount={forceDisplayHiddenCount}
      >
        {activityTargetObjectRecords.map((activityTargetObjectRecord) => (
          <RecordChip
            key={activityTargetObjectRecord.targetObject.id}
            record={activityTargetObjectRecord.targetObject}
            objectNameSingular={
              activityTargetObjectRecord.targetObjectMetadataItem.nameSingular
            }
          />
        ))}
      </ExpandableList>
    </StyledContainer>
  );
};
