import { useCoachingTickets } from '@/coaching/hooks/useCoachingTickets';
import styled from '@emotion/styled';
import { useState } from 'react';

type CoachingTicketsTabProps = {
  wpUserId: string | null;
};

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledSectionLabel = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledPanels = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: 1fr 1fr;
  min-height: 300px;
`;

const StyledPanel = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledPanelHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const StyledTableHeader = styled.th`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  text-align: left;
`;

const StyledTableRow = styled.tr<{ isSelected?: boolean }>`
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledTableCell = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xs};
  max-width: 120px;
  overflow: hidden;
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledStatusBadge = styled.span<{ statusColor: string }>`
  background: ${({ statusColor }) => statusColor}20;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ statusColor }) => statusColor};
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: 2px 8px;
`;

const StyledContentSection = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: 1fr 1fr;
  margin-top: ${({ theme }) => theme.spacing(3)};
  min-height: 200px;
`;

const StyledContentPanel = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledContentHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
`;

const StyledContentBody = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.5;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
  white-space: pre-wrap;
`;

const StyledEmptyText = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-style: italic;
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledLoadingText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledPanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const getStatusColor = (status: string | null | undefined) => {
  if (!status) return '#888';
  const lower = String(status).toLowerCase();
  if (lower.includes('resolved') || lower.includes('closed')) return '#27ae60';
  if (lower.includes('progress')) return '#f39c12';
  return '#3498db';
};

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateString);
  }
};

export const CoachingTicketsTab = ({ wpUserId }: CoachingTicketsTabProps) => {
  const { tickets, loading } = useCoachingTickets(wpUserId);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  if (loading) {
    return <StyledLoadingText>Loading tickets...</StyledLoadingText>;
  }

  if (tickets.length === 0) {
    return <StyledEmptyText>No tickets found</StyledEmptyText>;
  }

  const selectedTicket = selectedTicketId
    ? tickets.find((t) => t.id === selectedTicketId)
    : tickets[0];

  return (
    <StyledContainer>
      <StyledSectionLabel>Section</StyledSectionLabel>
      <StyledPanels>
        {/* Ticket Liste */}
        <StyledPanel>
          <StyledPanelHeader>Ticket Liste</StyledPanelHeader>
          <StyledPanelBody>
            <StyledTable>
              <thead>
                <tr>
                  <StyledTableHeader>Ticket ID</StyledTableHeader>
                  <StyledTableHeader>Ticket Status</StyledTableHeader>
                  <StyledTableHeader>Ticket created at</StyledTableHeader>
                  <StyledTableHeader>Title</StyledTableHeader>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <StyledTableRow
                    key={ticket.id}
                    isSelected={
                      ticket.id === (selectedTicket?.id ?? tickets[0]?.id)
                    }
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <StyledTableCell>
                      {String(ticket.ticketId ?? '')}
                    </StyledTableCell>
                    <StyledTableCell>
                      <StyledStatusBadge
                        statusColor={getStatusColor(
                          ticket.status as string | null,
                        )}
                      >
                        {String(ticket.status ?? '')}
                      </StyledStatusBadge>
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatDateTime(
                        ticket.ticketCreatedAt as string | null,
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {String(ticket.title ?? '')}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </tbody>
            </StyledTable>
          </StyledPanelBody>
        </StyledPanel>

        {/* Selektiertes Ticket Aktivität */}
        <StyledPanel>
          <StyledPanelHeader>Selektiertes Ticket Aktivität</StyledPanelHeader>
          <StyledPanelBody>
            {selectedTicket ? (
              <StyledTable>
                <thead>
                  <tr>
                    <StyledTableHeader>Ticket ID</StyledTableHeader>
                    <StyledTableHeader>Wann</StyledTableHeader>
                    <StyledTableHeader>Inhalt Aktivität</StyledTableHeader>
                  </tr>
                </thead>
                <tbody>
                  <StyledTableRow>
                    <StyledTableCell>
                      {String(selectedTicket.ticketId ?? '')}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatDateTime(
                        selectedTicket.ticketCreatedAt as string | null,
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {String(selectedTicket.title ?? '')}
                    </StyledTableCell>
                  </StyledTableRow>
                </tbody>
              </StyledTable>
            ) : (
              <StyledEmptyText>Select a ticket</StyledEmptyText>
            )}
          </StyledPanelBody>
        </StyledPanel>
      </StyledPanels>

      {/* Bottom content panels */}
      {selectedTicket && (
        <StyledContentSection>
          <StyledContentPanel>
            <StyledContentHeader>Anfrage</StyledContentHeader>
            <StyledContentBody>
              {String(selectedTicket.content ?? 'No content')}
            </StyledContentBody>
          </StyledContentPanel>
          <StyledContentPanel>
            <StyledContentHeader>Inhalt Aktivität</StyledContentHeader>
            <StyledContentBody>
              {String(selectedTicket.title ?? '')}
            </StyledContentBody>
          </StyledContentPanel>
        </StyledContentSection>
      )}
    </StyledContainer>
  );
};
