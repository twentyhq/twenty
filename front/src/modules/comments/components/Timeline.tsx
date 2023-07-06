import styled from '@emotion/styled';

import { IconNotes } from '@/ui/icons/index';
import { TableActionBarButtonCreateCommentThreadCompany } from '~/pages/companies/table/TableActionBarButtonCreateCommentThreadCompany';

const StyledTimelineContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  justify-content: flex-end;
  padding: 12px 16px 64px 16px;
`;
const StyledTimelineEmptyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  padding: 12px 16px 64px 16px;
`;

const StyledTimelineItemContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: 16px;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StyledItemTitleContainer = styled.div`
  align-content: flex-start;
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1 0 0;
  flex-wrap: wrap;
  gap: 4px 8px;
  height: 20px;
  span {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledItemTitleDate = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  width: 80px;
`;

const StyledVerticalLineContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: 8px;
  justify-content: center;
  width: 20px;
`;

const StyledVerticalLine = styled.div`
  align-self: stretch;
  background: ${({ theme }) => theme.border.color.light};
  flex-shrink: 0;
  width: 2px;
`;

const StyledCardContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 0px 4px 0px;
`;

const StyledCard = styled.div`
  align-items: flex-start;
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  padding: 12px;
`;

const StyledCardTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: 500;
  line-height: 150%;
`;

const StyledCardContent = styled.div`
  -webkit-box-orient: vertical;

  -webkit-line-clamp: 3;
  align-self: stretch;
  color: ${({ theme }) => theme.font.color.secondary};
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export function Timeline() {
  const commentThreads = ['1'];

  if (!commentThreads.length) {
    return (
      <StyledTimelineEmptyContainer>
        <h1>No activity yet</h1>
        <TableActionBarButtonCreateCommentThreadCompany />
      </StyledTimelineEmptyContainer>
    );
  }

  return (
    <StyledTimelineContainer>
      <StyledTimelineItemContainer>
        <StyledIconContainer>
          <IconNotes />
        </StyledIconContainer>
        <StyledItemTitleContainer>
          <span>Eddy Cue</span>sent a calendar invite to Steve and Alexandre
        </StyledItemTitleContainer>
        <StyledItemTitleDate>2 days ago</StyledItemTitleDate>
      </StyledTimelineItemContainer>
      <StyledTimelineItemContainer>
        <StyledVerticalLineContainer>
          <StyledVerticalLine></StyledVerticalLine>
        </StyledVerticalLineContainer>
        <StyledCardContainer>
          <StyledCard>
            <StyledCardTitle>
              Logged call (Phil Schiller / Steve Anavi)
            </StyledCardTitle>
            <StyledCardContent>
              Apple sells its products by focusing on the benefits users gain
              from their products, rather than solely highlighting the features.
              The same approach should be used for selling to Qonto. Understand
              their pain points and how your product can alleviate those issues.
              Emphasize how your CRM tool can help streamline their operations,
              improve customer service, and ultimately, grow their business.
            </StyledCardContent>
          </StyledCard>
        </StyledCardContainer>
      </StyledTimelineItemContainer>
    </StyledTimelineContainer>
  );
}
