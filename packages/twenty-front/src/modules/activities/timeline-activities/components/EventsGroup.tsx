import { styled } from '@linaria/react';

import { EventRow } from '@/activities/timeline-activities/components/EventRow';
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
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 24px;
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
  border-radius: 50px;
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
