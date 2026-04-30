import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { GET_TICKETS } from '../hooks/useTickets';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSubject = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
`;

const StyledValue = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSectionTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
`;

const StyledComment = styled.div<{ isInternal: boolean }>`
  padding: ${themeCssVariables.spacing[3]};
  border-radius: 8px;
  border-left: 3px solid ${({ isInternal }) =>
    isInternal ? themeCssVariables.color.yellow : themeCssVariables.color.blue};
  background: ${themeCssVariables.background.transparent.lighter};
`;

const StyledCommentAuthor = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledCommentDate = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  margin-left: ${themeCssVariables.spacing[2]};
`;

const StyledCommentBody = styled.p`
  margin: ${themeCssVariables.spacing[1]} 0 0;
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const TicketDetail = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_TICKETS, {
    variables: { limit: 1, offset: 0 },
  });

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const ticket = data?.tickets?.edges?.[0]?.node;

  if (!ticket) return <StyledError>{t`Ticket not found`}</StyledError>;

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledSubject>{ticket.ticketNumber}: {ticket.subject}</StyledSubject>
      </StyledHeader>
      <StyledMeta>
        <StyledMetaItem>
          <StyledLabel>{t`Status`}</StyledLabel>
          <StyledValue>{ticket.status}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Priority`}</StyledLabel>
          <StyledValue>{ticket.priority}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Assignee`}</StyledLabel>
          <StyledValue>{ticket.assigneeName ?? '---'}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Customer`}</StyledLabel>
          <StyledValue>{ticket.customerName ?? '---'}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Category`}</StyledLabel>
          <StyledValue>{ticket.category ?? '---'}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Created`}</StyledLabel>
          <StyledValue>{new Date(ticket.createdAt).toLocaleString()}</StyledValue>
        </StyledMetaItem>
      </StyledMeta>
      <StyledSection>
        <StyledSectionTitle>{t`Timeline`}</StyledSectionTitle>
        <StyledComment isInternal={false}>
          <StyledCommentAuthor>{ticket.customerName ?? '---'}</StyledCommentAuthor>
          <StyledCommentDate>{new Date(ticket.createdAt).toLocaleString()}</StyledCommentDate>
          <StyledCommentBody>{t`Ticket created`}</StyledCommentBody>
        </StyledComment>
        {ticket.firstResponseAt && (
          <StyledComment isInternal={true}>
            <StyledCommentAuthor>{ticket.assigneeName ?? '---'}</StyledCommentAuthor>
            <StyledCommentDate>{new Date(ticket.firstResponseAt).toLocaleString()}</StyledCommentDate>
            <StyledLabel> {t`Internal`}</StyledLabel>
            <StyledCommentBody>{t`First response`}</StyledCommentBody>
          </StyledComment>
        )}
        {ticket.resolvedAt && (
          <StyledComment isInternal={false}>
            <StyledCommentAuthor>{ticket.assigneeName ?? '---'}</StyledCommentAuthor>
            <StyledCommentDate>{new Date(ticket.resolvedAt).toLocaleString()}</StyledCommentDate>
            <StyledCommentBody>{t`Resolved`}</StyledCommentBody>
          </StyledComment>
        )}
      </StyledSection>
    </StyledContainer>
  );
};
