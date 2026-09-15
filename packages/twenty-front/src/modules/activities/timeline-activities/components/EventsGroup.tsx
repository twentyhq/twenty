import { styled } from '@linaria/react';

import { EventRow } from '@/activities/timeline-activities/components/EventRow';
import { TIMELINE_ICON_SLOT_SIZE } from '@/activities/timeline-activities/constants/TimelineIconSlotSize';
import { type EventGroup } from '@/activities/timeline-activities/utils/groupEventsByMonth';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventsGroupProps = {
  group: EventGroup;
  month: string;
  year?: number;
  mainObjectMetadataItem: EnrichedObjectMetadataItem | null;
};

const StyledActivityGroup = styled.div`
  display: flex;
  flex-flow: column;
  gap: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledActivityGroupContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
  position: relative;
`;

const StyledActivityGroupBar = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: ${TIMELINE_ICON_SLOT_SIZE}px;
`;

const StyledMonthSeperator = styled.div`
  align-items: center;
  align-self: stretch;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[4]};
`;
const StyledMonthSeperatorLine = styled.div`
  background: ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  corner-shape: round;
  flex: 1 0 0;
  height: 1px;
`;

export const EventsGroup = ({
  group,
  month,
  year,
  mainObjectMetadataItem,
}: EventsGroupProps) => {
  return (
    <StyledActivityGroup>
      <StyledMonthSeperator>
        {month} {year}
        <StyledMonthSeperatorLine />
      </StyledMonthSeperator>
      <StyledActivityGroupContainer>
        <StyledActivityGroupBar />
        {group.items.map((event, index) => (
          <EventRow
            mainObjectMetadataItem={mainObjectMetadataItem}
            key={index}
            event={event}
            isLastEvent={index === group.items.length - 1}
          />
        ))}
      </StyledActivityGroupContainer>
    </StyledActivityGroup>
  );
};
