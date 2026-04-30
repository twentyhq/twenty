import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { TicketData, TicketPriority, TicketStatus } from '../types/ticket.types';

const MOCK_TICKETS: TicketData[] = [
  { id: 'T-1001', subject: 'Cannot access dashboard', description: '', status: 'open', priority: 'high', category: 'technical', channel: 'email', assignee: 'Ana Torres', requester: 'Carlos Mendez', createdAt: '2026-04-28T10:00:00Z', updatedAt: '2026-04-28T12:00:00Z', slaDeadline: '2026-04-29T10:00:00Z', comments: [] },
  { id: 'T-1002', subject: 'Billing discrepancy Q1', description: '', status: 'in_progress', priority: 'medium', category: 'billing', channel: 'phone', assignee: 'Luis Reyes', requester: 'Maria Lopez', createdAt: '2026-04-27T08:00:00Z', updatedAt: '2026-04-28T09:00:00Z', slaDeadline: '2026-04-30T08:00:00Z', comments: [] },
  { id: 'T-1003', subject: 'Feature request: dark mode', description: '', status: 'waiting', priority: 'low', category: 'feature_request', channel: 'portal', assignee: 'Ana Torres', requester: 'Pedro Ruiz', createdAt: '2026-04-25T14:00:00Z', updatedAt: '2026-04-26T14:00:00Z', slaDeadline: '2026-05-02T14:00:00Z', comments: [] },
  { id: 'T-1004', subject: 'App crashes on export', description: '', status: 'open', priority: 'urgent', category: 'bug', channel: 'chat', assignee: 'Luis Reyes', requester: 'Sofia Garcia', createdAt: '2026-04-28T15:00:00Z', updatedAt: '2026-04-28T15:30:00Z', slaDeadline: '2026-04-28T19:00:00Z', comments: [] },
];

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: themeCssVariables.color.gray50,
  medium: themeCssVariables.color.yellow,
  high: themeCssVariables.color.orange,
  urgent: themeCssVariables.color.red,
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting: 'Waiting',
  resolved: 'Resolved',
  closed: 'Closed',
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
  font-weight: ${themeCssVariables.font.weight.medium};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledSlaTimer = styled.span<{ isOverdue: boolean }>`
  color: ${({ isOverdue }) =>
    isOverdue ? themeCssVariables.color.red : themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
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

export const TicketList = () => {
  useLingui();
  const now = new Date();

  return (
    <StyledContainer>
      <StyledTitle>{t`Support Tickets`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`ID`}</StyledTh>
            <StyledTh>{t`Subject`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Priority`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Assignee`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`SLA`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_TICKETS.map((ticket) => {
            const slaDate = new Date(ticket.slaDeadline);
            const isOverdue = slaDate < now;
            const hoursLeft = Math.round((slaDate.getTime() - now.getTime()) / 3600000);
            return (
              <tr key={ticket.id}>
                <StyledTd>{ticket.id}</StyledTd>
                <StyledTd>{ticket.subject}</StyledTd>
                <StyledTd>{STATUS_LABELS[ticket.status]}</StyledTd>
                <StyledTd>
                  <StyledBadge color={PRIORITY_COLORS[ticket.priority]}>
                    {ticket.priority}
                  </StyledBadge>
                </StyledTd>
                <StyledResponsiveHide>{ticket.assignee}</StyledResponsiveHide>
                <StyledResponsiveHide>
                  <StyledSlaTimer isOverdue={isOverdue}>
                    {isOverdue ? t`Overdue` : t`${hoursLeft}h left`}
                  </StyledSlaTimer>
                </StyledResponsiveHide>
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
