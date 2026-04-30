import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { CoachingSessionData } from '../types/coaching.types';

const MOCK_SESSIONS: CoachingSessionData[] = [
  { id: 'CS-1', repName: 'Juan Perez', coachName: 'Maria Lopez', topic: 'Objection handling', scheduledAt: '2026-05-02T10:00:00Z', duration: 45, status: 'scheduled', notes: '' },
  { id: 'CS-2', repName: 'Luis Reyes', coachName: 'Ana Torres', topic: 'Discovery call framework', scheduledAt: '2026-04-28T14:00:00Z', duration: 30, status: 'completed', notes: 'Reviewed SPIN technique' },
  { id: 'CS-3', repName: 'Pedro Ruiz', coachName: 'Maria Lopez', topic: 'Negotiation tactics', scheduledAt: '2026-05-05T09:00:00Z', duration: 60, status: 'scheduled', notes: '' },
  { id: 'CS-4', repName: 'Juan Perez', coachName: 'Ana Torres', topic: 'Pipeline review', scheduledAt: '2026-04-25T11:00:00Z', duration: 30, status: 'cancelled', notes: '' },
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: themeCssVariables.color.blue,
  completed: themeCssVariables.color.green,
  cancelled: themeCssVariables.color.gray50,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledResponsiveHide = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledResponsiveHideHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

export const CoachingSessions = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Coaching Sessions`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Rep`}</StyledTh>
            <StyledTh>{t`Topic`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Coach`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Date`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_SESSIONS.map((session) => (
            <tr key={session.id}>
              <StyledTd>{session.repName}</StyledTd>
              <StyledTd>{session.topic}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[session.status]}>{session.status}</StyledBadge>
              </StyledTd>
              <StyledResponsiveHide>{session.coachName}</StyledResponsiveHide>
              <StyledResponsiveHide>{new Date(session.scheduledAt).toLocaleDateString()}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
