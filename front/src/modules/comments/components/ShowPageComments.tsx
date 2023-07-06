import styled from '@emotion/styled';

import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';
import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import {
  SortOrder,
  useGetCommentThreadsByTargetsQuery,
} from '~/generated/graphql';

import { CommentableEntity } from '../types/CommentableEntity';

import { CommentThread } from './CommentThread';

const StyledTopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-size: 13px;
  justify-content: space-between;
  min-height: 40px;
  padding-left: 8px;
  padding-right: 8px;
`;

const StyledTopBarTitle = styled.div`
  align-items: center;
  font-weight: 500;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

export function ShowPageComments({
  commentableEntity,
}: {
  commentableEntity?: CommentableEntity;
}) {
  const { data: queryResult } = useGetCommentThreadsByTargetsQuery({
    variables: {
      commentThreadTargetIds: commentableEntity ? [commentableEntity.id] : [],
      orderBy: [
        {
          createdAt: SortOrder.Desc,
        },
      ],
    },
  });

  const commentThreads: CommentThreadForDrawer[] =
    queryResult?.findManyCommentThreads ?? [];

  return (
    <RightDrawerPage>
      <StyledTopBar>
        <StyledTopBarTitle>Timeline</StyledTopBarTitle>
      </StyledTopBar>
      <RightDrawerBody>
        {commentThreads.map((commentThread) => (
          <CommentThread key={commentThread.id} commentThread={commentThread} />
        ))}
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
