import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ASSIGN_TICKET,
  CREATE_TICKET,
  GET_TICKETS,
} from '../hooks/useTickets';
import { TicketPriority, TicketStatus } from '../types/ticket.types';

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: themeCssVariables.color.gray50,
  medium: themeCssVariables.color.yellow,
  high: themeCssVariables.color.orange,
  urgent: themeCssVariables.color.red,
};

const STATUS_OPTIONS: TicketStatus[] = [
  'open',
  'in_progress',
  'waiting',
  'resolved',
  'closed',
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  align-items: center;
`;

const StyledSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledButton = styled.button`
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledInput = styled.input`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  flex: 1;
  min-width: 140px;
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

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledForm = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const TicketList = () => {
  useLingui();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_TICKETS, {
    variables: {
      status: statusFilter || undefined,
      limit: 50,
      offset: 0,
    },
  });

  const [createTicket, { loading: creating }] = useMutation(CREATE_TICKET, {
    onCompleted: () => {
      setSubject('');
      setShowForm(false);
      refetch();
    },
  });

  const [assignTicket] = useMutation(ASSIGN_TICKET, {
    onCompleted: () => refetch(),
  });

  const handleCreate = () => {
    if (!subject.trim()) return;
    createTicket({
      variables: {
        input: { subject, priority, category: 'general' },
      },
    });
  };

  const handleAssign = (ticketId: string) => {
    const id = prompt('Enter assignee ID:');
    if (id) {
      assignTicket({ variables: { ticketId, assigneeId: id } });
    }
  };

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const tickets =
    data?.tickets?.edges?.map(
      (edge: { node: Record<string, unknown> }) => edge.node,
    ) ?? [];

  return (
    <StyledContainer>
      <StyledToolbar>
        <StyledSelect
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">{t`All statuses`}</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </StyledSelect>
        <StyledButton onClick={() => setShowForm(!showForm)}>
          {showForm ? t`Cancel` : t`New Ticket`}
        </StyledButton>
      </StyledToolbar>

      {showForm && (
        <StyledForm>
          <StyledInput
            placeholder={t`Subject`}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
          <StyledSelect
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TicketPriority)
            }
          >
            <option value="low">{t`Low`}</option>
            <option value="medium">{t`Medium`}</option>
            <option value="high">{t`High`}</option>
            <option value="urgent">{t`Urgent`}</option>
          </StyledSelect>
          <StyledButton onClick={handleCreate} disabled={creating}>
            {creating ? t`Creating...` : t`Create`}
          </StyledButton>
        </StyledForm>
      )}

      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`ID`}</StyledTh>
            <StyledTh>{t`Subject`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Priority`}</StyledTh>
            <StyledHideMobileHeader>{t`Assignee`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Actions`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {tickets.map(
            (ticket: {
              id: string;
              ticketNumber: string;
              subject: string;
              status: TicketStatus;
              priority: TicketPriority;
              assigneeName: string;
            }) => (
              <tr key={ticket.id}>
                <StyledTd>{ticket.ticketNumber}</StyledTd>
                <StyledTd>{ticket.subject}</StyledTd>
                <StyledTd>{ticket.status.replace('_', ' ')}</StyledTd>
                <StyledTd>
                  <StyledBadge
                    color={
                      PRIORITY_COLORS[ticket.priority] ??
                      themeCssVariables.color.gray50
                    }
                  >
                    {ticket.priority}
                  </StyledBadge>
                </StyledTd>
                <StyledHideMobile>
                  {ticket.assigneeName ?? '---'}
                </StyledHideMobile>
                <StyledHideMobile>
                  <StyledButton onClick={() => handleAssign(ticket.id)}>
                    {t`Assign`}
                  </StyledButton>
                </StyledHideMobile>
              </tr>
            ),
          )}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
