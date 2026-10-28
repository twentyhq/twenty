import { styled } from '@linaria/react';

import { EventRow } from '@/activities/timeline-activities/components/EventRow';
import { type EventGroup } from '@/activities/timeline-activities/utils/groupEventsByMonth';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { themeCssVariables } from 'twenty-ui/theme';

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

const StyledMonthSeperator = styled.div`
  align-items: center;
  align-self: stretch;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[4]};
  letter-spacing: 0.02em;
`;
const StyledMonthSeperatorLine = styled.div`
  background: ${themeCssVariables.border.color.medium};
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
