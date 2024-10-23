import styled from '@emotion/styled';

import { EventRow } from '@/activities/timeline-activities/components/EventRow';
import { EventGroup } from '@/activities/timeline-activities/utils/groupEventsByMonth';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type EventsGroupProps = {
  group: EventGroup;
  month: string;
  year?: number;
  mainObjectMetadataItem: ObjectMetadataItem | null;
};

const StyledActivityGroup = styled.div`
  display: flex;
  flex-flow: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledActivityGroupContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(3)};
  position: relative;
`;

const StyledActivityGroupBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
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
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.xs};
`;
const StyledMonthSeperatorLine = styled.div`
  background: ${({ theme }) => theme.border.color.light};
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
