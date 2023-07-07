import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';

import { IconNotes, IconPlus } from '@/ui/icons/index';
import {
  beautifyExactDate,
  beautifyPastDateRelativeToNow,
} from '@/utils/datetime/date-utils';
import {
  SortOrder,
  useGetCommentThreadsByTargetsQuery,
} from '~/generated/graphql';
import { TableActionBarButtonCreateCommentThreadCompany } from '~/pages/companies/table/TableActionBarButtonCreateCommentThreadCompany';

import { CommentableEntity } from '../types/CommentableEntity';
import { CommentThreadForDrawer } from '../types/CommentThreadForDrawer';

const StyledTimelineContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  justify-content: flex-start;
  overflow-y: auto;
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
  width: 110px;
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

const StyledTooltip = styled(Tooltip)`
  background-color: ${({ theme }) => theme.background.primary};

  box-shadow: 0px 2px 4px 3px
    ${({ theme }) => theme.background.transparent.light};

  box-shadow: 2px 4px 16px 6px
    ${({ theme }) => theme.background.transparent.light};

  color: ${({ theme }) => theme.font.color.primary};

  opacity: 1;
  padding: 8px;
`;

const StyledBottomActionBar = styled.div`
  align-items: flex-start;
  align-self: stretch;
  bottom: 8px;
  display: flex;
  flex-direction: column;
  position: absolute;
`;

export function Timeline({ entity }: { entity: CommentableEntity }) {
  const { data: queryResult } = useGetCommentThreadsByTargetsQuery({
    variables: {
      commentThreadTargetIds: [entity.id],
      orderBy: [
        {
          createdAt: SortOrder.Desc,
        },
      ],
    },
  });

  const commentThreads: CommentThreadForDrawer[] =
    queryResult?.findManyCommentThreads ?? [];

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
      {commentThreads.map((commentThread) => {
        const beautifiedCreatedAt = beautifyPastDateRelativeToNow(
          commentThread.createdAt,
        );
        const exactCreatedAt = beautifyExactDate(commentThread.createdAt);

        return (
          <>
            <StyledTimelineItemContainer>
              <StyledIconContainer>
                <IconNotes />
              </StyledIconContainer>
              <StyledItemTitleContainer>
                <span>
                  {commentThread.author.firstName}{' '}
                  {commentThread.author.lastName}
                </span>
                created a note
              </StyledItemTitleContainer>
              <StyledItemTitleDate id={`id-${commentThread.id}`}>
                {beautifiedCreatedAt} ago
              </StyledItemTitleDate>
              <StyledTooltip
                anchorSelect={`#id-${commentThread.id}`}
                content={exactCreatedAt}
                clickable
                noArrow
              />
            </StyledTimelineItemContainer>
            <StyledTimelineItemContainer>
              <StyledVerticalLineContainer>
                <StyledVerticalLine></StyledVerticalLine>
              </StyledVerticalLineContainer>
              <StyledCardContainer>
                <StyledCard onClick={() => null}>
                  <StyledCardTitle>{commentThread.title}</StyledCardTitle>
                  <StyledCardContent>{commentThread.body}</StyledCardContent>
                </StyledCard>
              </StyledCardContainer>
            </StyledTimelineItemContainer>
          </>
        );
      })}

      <StyledBottomActionBar>
        <StyledTimelineItemContainer>
          <StyledIconContainer>
            <IconPlus />
          </StyledIconContainer>

          <TableActionBarButtonCreateCommentThreadCompany />
        </StyledTimelineItemContainer>
      </StyledBottomActionBar>
    </StyledTimelineContainer>
  );
}
