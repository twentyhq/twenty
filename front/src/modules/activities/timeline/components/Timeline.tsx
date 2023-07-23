import React from 'react';
import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';

import { CommentThreadCreateButton } from '@/activities/components/CommentThreadCreateButton';
import { useOpenCommentThreadRightDrawer } from '@/activities/hooks/useOpenCommentThreadRightDrawer';
import { useOpenCreateCommentThreadDrawer } from '@/activities/hooks/useOpenCreateCommentThreadDrawer';
import { CommentableEntity } from '@/activities/types/CommentableEntity';
import { CommentThreadForDrawer } from '@/activities/types/CommentThreadForDrawer';
import { useIsMobile } from '@/ui/hooks/useIsMobile';
import { IconNotes } from '@/ui/icon/index';
import {
  ActivityType,
  SortOrder,
  useGetCommentThreadsByTargetsQuery,
} from '~/generated/graphql';
import {
  beautifyExactDate,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

import { OverflowingTextWithTooltip } from '../../../ui/tooltip/OverflowingTextWithTooltip';

const StyledMainContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  border-top: ${({ theme }) =>
    useIsMobile() ? `1px solid ${theme.border.color.medium}` : 'none'};
  display: flex;
  flex: 1 0 0;
  flex-direction: column;

  justify-content: center;
`;

const StyledTimelineContainer = styled.div`
  align-items: center;
  align-self: stretch;

  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  justify-content: flex-start;
  overflow-y: auto;

  padding: 12px 16px 12px 16px;
`;

const StyledTimelineEmptyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
`;

const StyledEmptyTimelineTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledEmptyTimelineSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTimelineItemContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: 16px;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StyledItemTitleContainer = styled.div`
  align-content: center;
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1 0 0;
  flex-wrap: wrap;
  gap: 4px;
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
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0px 20px 0px;
`;

const StyledCard = styled.div`
  align-items: flex-start;
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  padding: 12px;
`;

const StyledCardTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};

  width: 100%;
`;

const StyledCardContent = styled.div`
  align-self: stretch;
  color: ${({ theme }) => theme.font.color.secondary};

  width: 100%;
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

const StyledTopActionBar = styled.div`
  align-items: flex-start;
  align-self: stretch;
  backdrop-filter: ${() => (useIsMobile() ? 'none' : `blur(5px)`)};

  border-bottom: ${({ theme }) =>
    useIsMobile() ? 'none' : `1px solid ${theme.border.color.medium}`};

  border-top-right-radius: ${() => (useIsMobile() ? 'none' : `8px`)};

  display: flex;
  flex-direction: column;
  left: 0px;
  padding: 12px 16px 12px 16px;
  position: sticky;
  top: 0px;
`;

export function Timeline({ entity }: { entity: CommentableEntity }) {
  const { data: queryResult, loading } = useGetCommentThreadsByTargetsQuery({
    variables: {
      commentThreadTargetIds: [entity.id],
      orderBy: [
        {
          createdAt: SortOrder.Desc,
        },
      ],
    },
  });

  const openCommentThreadRightDrawer = useOpenCommentThreadRightDrawer();

  const openCreateCommandThread = useOpenCreateCommentThreadDrawer();

  const commentThreads: CommentThreadForDrawer[] =
    queryResult?.findManyCommentThreads ?? [];

  if (loading) {
    return <></>;
  }

  if (!commentThreads.length) {
    return (
      <StyledTimelineEmptyContainer>
        <StyledEmptyTimelineTitle>No activity yet</StyledEmptyTimelineTitle>
        <StyledEmptyTimelineSubTitle>Create one:</StyledEmptyTimelineSubTitle>
        <CommentThreadCreateButton
          onNoteClick={() => openCreateCommandThread(entity, ActivityType.Note)}
          onTaskClick={() => openCreateCommandThread(entity, ActivityType.Task)}
        />
      </StyledTimelineEmptyContainer>
    );
  }

  return (
    <StyledMainContainer>
      <StyledTopActionBar>
        <StyledTimelineItemContainer>
          <CommentThreadCreateButton
            onNoteClick={() =>
              openCreateCommandThread(entity, ActivityType.Note)
            }
            onTaskClick={() =>
              openCreateCommandThread(entity, ActivityType.Task)
            }
          />
        </StyledTimelineItemContainer>
      </StyledTopActionBar>
      <StyledTimelineContainer>
        {commentThreads.map((commentThread) => {
          const beautifiedCreatedAt = beautifyPastDateRelativeToNow(
            commentThread.createdAt,
          );
          const exactCreatedAt = beautifyExactDate(commentThread.createdAt);
          const body = JSON.parse(commentThread.body ?? '{}')[0]?.content[0]
            ?.text;

          return (
            <React.Fragment key={commentThread.id}>
              <StyledTimelineItemContainer>
                <StyledIconContainer>
                  <IconNotes />
                </StyledIconContainer>
                <StyledItemTitleContainer>
                  <span>{commentThread.author.displayName}</span>
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
                  <StyledCard
                    onClick={() =>
                      openCommentThreadRightDrawer(commentThread.id)
                    }
                  >
                    <StyledCardTitle>
                      <OverflowingTextWithTooltip
                        text={
                          commentThread.title
                            ? commentThread.title
                            : '(No title)'
                        }
                      />
                    </StyledCardTitle>
                    <StyledCardContent>
                      <OverflowingTextWithTooltip
                        text={body ? body : '(No content)'}
                      />
                    </StyledCardContent>
                  </StyledCard>
                </StyledCardContainer>
              </StyledTimelineItemContainer>
            </React.Fragment>
          );
        })}
      </StyledTimelineContainer>
    </StyledMainContainer>
  );
}
