import { useRecoilState } from 'recoil';

import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';
import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';
import { useGetCommentThreadsByTargetsQuery } from '~/generated/graphql';

import { commentableEntityArrayState } from '../../states/commentableEntityArrayState';

import { CommentThread } from './CommentThread';

export function RightDrawerComments() {
  const [commentableEntityArray] = useRecoilState(commentableEntityArrayState);

  const { data: queryResult } = useGetCommentThreadsByTargetsQuery({
    variables: {
      commentThreadTargetIds: commentableEntityArray.map(
        (commentableEntity) => commentableEntity.id,
      ),
    },
  });

  const commentThreads: CommentThreadForDrawer[] =
    queryResult?.findManyCommentThreads ?? [];

  return (
    <RightDrawerPage>
      <RightDrawerTopBar title="Comments" />
      <RightDrawerBody>
        {commentThreads.map((commentThread) => (
          <CommentThread key={commentThread.id} commentThread={commentThread} />
        ))}
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
