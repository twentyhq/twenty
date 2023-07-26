import React from 'react';
import styled from '@emotion/styled';

import { CommentThreadCreateButton } from '@/activities/components/CommentThreadCreateButton';
import { useOpenCreateCommentThreadDrawer } from '@/activities/hooks/useOpenCreateCommentThreadDrawer';
import { CommentableEntity } from '@/activities/types/CommentableEntity';
import { CommentThreadForDrawer } from '@/activities/types/CommentThreadForDrawer';
import { useIsMobile } from '@/ui/hooks/useIsMobile';
import { IconCircleDot } from '@/ui/icon';
import {
  ActivityType,
  SortOrder,
  useGetCommentThreadsByTargetsQuery,
} from '~/generated/graphql';

import { TimelineActivity } from './TimelineActivity';

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

  const StyledStartIcon = styled.div`
    align-items: center;
    align-self: stretch;
    color: ${({ theme }) => theme.font.color.tertiary};
    display: flex;
    gap: 16px;
    height: 20px;
    justify-content: center;
    width: 20px;
  `;

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
        <CommentThreadCreateButton
          onNoteClick={() => openCreateCommandThread(entity, ActivityType.Note)}
          onTaskClick={() => openCreateCommandThread(entity, ActivityType.Task)}
        />
      </StyledTopActionBar>
      <StyledTimelineContainer>
        {commentThreads.map((commentThread) => (
          <TimelineActivity
            key={commentThread.id}
            commentThread={commentThread}
          />
        ))}
        <StyledStartIcon>
          <IconCircleDot />
        </StyledStartIcon>
      </StyledTimelineContainer>
    </StyledMainContainer>
  );
}
