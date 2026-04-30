import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { TicketData } from '../types/ticket.types';

const MOCK_TICKET: TicketData = {
  id: 'T-1001',
  subject: 'Cannot access dashboard',
  description: 'User reports 403 error when navigating to /dashboard after login. Issue started after password reset.',
  status: 'in_progress',
  priority: 'high',
  category: 'technical',
  channel: 'email',
  assignee: 'Ana Torres',
  requester: 'Carlos Mendez',
  createdAt: '2026-04-28T10:00:00Z',
  updatedAt: '2026-04-28T14:00:00Z',
  slaDeadline: '2026-04-29T10:00:00Z',
  linkedDealId: 'D-500',
  comments: [
    { id: 'c1', author: 'Carlos Mendez', content: 'I tried clearing cache, still not working.', createdAt: '2026-04-28T11:00:00Z', isInternal: false },
    { id: 'c2', author: 'Ana Torres', content: 'Checking permissions table — looks like role was reset.', createdAt: '2026-04-28T12:30:00Z', isInternal: true },
    { id: 'c3', author: 'Ana Torres', content: 'Hi Carlos, we found the issue. Your role was reset during the password change. Fixed now.', createdAt: '2026-04-28T14:00:00Z', isInternal: false },
  ],
};

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

export const TicketDetail = () => {
  useLingui();
  const ticket = MOCK_TICKET;

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledSubject>{ticket.id}: {ticket.subject}</StyledSubject>
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
          <StyledValue>{ticket.assignee}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Requester`}</StyledLabel>
          <StyledValue>{ticket.requester}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Channel`}</StyledLabel>
          <StyledValue>{ticket.channel}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Linked Deal`}</StyledLabel>
          <StyledValue>{ticket.linkedDealId ?? '—'}</StyledValue>
        </StyledMetaItem>
      </StyledMeta>
      <StyledSection>
        <StyledSectionTitle>{t`Description`}</StyledSectionTitle>
        <StyledValue>{ticket.description}</StyledValue>
      </StyledSection>
      <StyledSection>
        <StyledSectionTitle>{t`Timeline`}</StyledSectionTitle>
        {ticket.comments.map((comment) => (
          <StyledComment key={comment.id} isInternal={comment.isInternal}>
            <StyledCommentAuthor>{comment.author}</StyledCommentAuthor>
            <StyledCommentDate>{new Date(comment.createdAt).toLocaleString()}</StyledCommentDate>
            {comment.isInternal && <StyledLabel> {t`Internal`}</StyledLabel>}
            <StyledCommentBody>{comment.content}</StyledCommentBody>
          </StyledComment>
        ))}
      </StyledSection>
    </StyledContainer>
  );
};
