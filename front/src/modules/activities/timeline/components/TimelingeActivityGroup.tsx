import styled from '@emotion/styled';

import { ActivityGroup } from '../utils/groupActivitiesByMonth';

import { TimelineActivity } from './TimelineActivity';

type OwnProps = {
  group: ActivityGroup;
  month: string;
  year?: number;
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

export const TimelineActivityGroup = ({ group, month, year }: OwnProps) => {
  return (
    <StyledActivityGroup>
      <StyledMonthSeperator>
        {month} {year}
        <StyledMonthSeperatorLine />
      </StyledMonthSeperator>
      <StyledActivityGroupContainer>
        <StyledActivityGroupBar />
        {group.items.map((activity, index) => (
          <TimelineActivity
            key={activity.id}
            activity={activity}
            isLastActivity={index === group.items.length - 1}
          />
        ))}
      </StyledActivityGroupContainer>
    </StyledActivityGroup>
  );
};
