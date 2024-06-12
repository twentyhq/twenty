import styled from '@emotion/styled';

import { EventFieldDiffLabel } from '@/activities/timelineActivities/rows/mainObject/components/EventFieldDiffLabel';
import { EventFieldDiffValue } from '@/activities/timelineActivities/rows/mainObject/components/EventFieldDiffValue';
import { EventFieldDiffValueEffect } from '@/activities/timelineActivities/rows/mainObject/components/EventFieldDiffValueEffect';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type EventFieldDiffProps = {
  diffRecord: Record<string, any>;
  mainObjectMetadataItem: ObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem | undefined;
  forgedRecordId: string;
};

const StyledEventFieldDiffContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 24px;
  width: 250px;
`;

export const EventFieldDiff = ({
  diffRecord,
  mainObjectMetadataItem,
  fieldMetadataItem,
  forgedRecordId,
}: EventFieldDiffProps) => {
  if (!fieldMetadataItem) {
    return null;
  }

  return (
    <StyledEventFieldDiffContainer>
      <EventFieldDiffLabel fieldMetadataItem={fieldMetadataItem} />→
      <EventFieldDiffValueEffect
        forgedRecordId={forgedRecordId}
        mainObjectMetadataItem={mainObjectMetadataItem}
        fieldMetadataItem={fieldMetadataItem}
        diffRecord={diffRecord}
      />
      <EventFieldDiffValue
        forgedRecordId={forgedRecordId}
        mainObjectMetadataItem={mainObjectMetadataItem}
        fieldMetadataItem={fieldMetadataItem}
      />
    </StyledEventFieldDiffContainer>
  );
};
