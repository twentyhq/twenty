import styled from '@emotion/styled';

import { EventRow } from '@/activities/events/components/EventRow';
import { EventGroup } from '@/activities/events/utils/groupEventsByMonth';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

type EventsGroupProps = {
  group: EventGroup;
  month: string;
  year?: number;
  targetableObject: ActivityTargetableObject;
};

const StyledActivityGroup = styled.div`
  display: flex;
  flex-flow: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledActivityGroupContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledActivityGroupBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.xl};
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
  targetableObject,
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
            targetableObject={targetableObject}
            key={event.id}
            event={event}
            isLastEvent={index === group.items.length - 1}
          />
        ))}
      </StyledActivityGroupContainer>
    </StyledActivityGroup>
  );
};
