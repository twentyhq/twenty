import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/services';
import { GET_PEOPLE } from '@/people/services';
import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';
import { useOpenRightDrawer } from '@/ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { logError } from '@/utils/logs/logError';
import { isDefined } from '@/utils/type-guards/isDefined';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';
import { useCreateCommentThreadWithCommentMutation } from '~/generated/graphql';

import { GET_COMMENT_THREAD } from '../services';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';

import { CommentThreadCreateMode } from './CommentThreadCreateMode';

export function RightDrawerCreateCommentThread() {
  const [commentableEntityArray] = useRecoilState(commentableEntityArrayState);

  const openRightDrawer = useOpenRightDrawer();

  const [createCommentThreadWithComment] =
    useCreateCommentThreadWithCommentMutation();

  const currentUser = useRecoilValue(currentUserState);

  function handleNewCommentThread(commentText: string) {
    if (!isNonEmptyString(commentText)) {
      return;
    }

    if (!isDefined(currentUser)) {
      logError(
        'In handleCreateCommentThread, currentUser is not defined, this should not happen.',
      );
      return;
    }

    createCommentThreadWithComment({
      variables: {
        authorId: currentUser.id,
        commentText: commentText,
        commentThreadId: v4(),
        createdAt: new Date().toISOString(),
        commentThreadTargetArray: commentableEntityArray.map(
          (commentableEntity) => ({
            commentableId: commentableEntity.id,
            commentableType: commentableEntity.type,
            id: v4(),
            createdAt: new Date().toISOString(),
          }),
        ),
      },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_COMMENT_THREAD) ?? '',
      ],
      onCompleted(data) {
        // TODO : redirect to drawer comment thread with data.createOneCommentThread.id
        openRightDrawer('comments');
      },
    });
  }

  return (
    <RightDrawerPage>
      <RightDrawerTopBar
        title="New note"
        onClick={() => handleNewCommentThread('text')}
      />
      <RightDrawerBody>
        <CommentThreadCreateMode
          commentableEntityArray={commentableEntityArray}
        />
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
