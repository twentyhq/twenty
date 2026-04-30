import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { EventData, EventStatus } from '../types/events.types';

const MOCK_EVENTS: EventData[] = [
  { id: 'EV1', name: 'CRM Summit 2026', type: 'conference', status: 'upcoming', date: '2026-06-15', location: 'Bogota, Corferias', registrations: 320, capacity: 500, budget: 85000000, currency: 'COP' },
  { id: 'EV2', name: 'Product Demo Day', type: 'webinar', status: 'live', date: '2026-04-29', location: 'Virtual', registrations: 150, capacity: 300, budget: 5000000, currency: 'COP' },
  { id: 'EV3', name: 'Partner Workshop Q1', type: 'workshop', status: 'completed', date: '2026-03-20', location: 'Medellin', registrations: 45, capacity: 50, budget: 12000000, currency: 'COP' },
  { id: 'EV4', name: 'Tech Meetup Cali', type: 'meetup', status: 'upcoming', date: '2026-05-10', location: 'Cali, WeWork', registrations: 60, capacity: 80, budget: 3000000, currency: 'COP' },
];

const STATUS_COLORS: Record<EventStatus, string> = {
  upcoming: themeCssVariables.color.blue,
  live: themeCssVariables.color.turquoise,
  completed: themeCssVariables.color.gray50,
  cancelled: themeCssVariables.color.red,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
  align-self: flex-start;
`;

const StyledBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${themeCssVariables.background.transparent.medium};
  overflow: hidden;
`;

const StyledBarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: ${themeCssVariables.color.blue};
  border-radius: 3px;
`;

export const EventList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Events`}</StyledTitle>
      <StyledGrid>
        {MOCK_EVENTS.map((event) => {
          const fillPercent = Math.round((event.registrations / event.capacity) * 100);
          return (
            <StyledCard key={event.id}>
              <StyledBadge color={STATUS_COLORS[event.status]}>{event.status}</StyledBadge>
              <StyledName>{event.name}</StyledName>
              <StyledDetail>{event.date} - {event.location}</StyledDetail>
              <StyledRow>
                <span>{t`Registrations`}: {event.registrations}/{event.capacity}</span>
                <span>{fillPercent}%</span>
              </StyledRow>
              <StyledBar>
                <StyledBarFill percent={fillPercent} />
              </StyledBar>
            </StyledCard>
          );
        })}
      </StyledGrid>
    </StyledContainer>
  );
};
