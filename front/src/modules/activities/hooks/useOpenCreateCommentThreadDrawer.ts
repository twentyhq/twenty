import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/queries';
import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { useOpenRightDrawer } from '@/ui/right-drawer/hooks/useOpenRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/right-drawer/types/RightDrawerPages';
import {
  ActivityType,
  useCreateCommentThreadMutation,
} from '~/generated/graphql';

import { GET_COMMENT_THREAD, GET_COMMENT_THREADS_BY_TARGETS } from '../queries';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { viewableCommentThreadIdState } from '../states/viewableCommentThreadIdState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenCreateCommentThreadDrawer() {
  const openRightDrawer = useOpenRightDrawer();
  const [createCommentThreadMutation] = useCreateCommentThreadMutation();
  const currentUser = useRecoilValue(currentUserState);
  const setHotkeyScope = useSetHotkeyScope();

  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );
  const [, setViewableCommentThreadId] = useRecoilState(
    viewableCommentThreadIdState,
  );

  return function openCreateCommentThreadDrawer(
    entity: CommentableEntity,
    type: ActivityType,
  ) {
    createCommentThreadMutation({
      variables: {
        authorId: currentUser?.id ?? '',
        commentThreadId: v4(),
        createdAt: new Date().toISOString(),
        type: type,
        commentThreadTargetArray: [
          {
            commentableId: entity.id,
            commentableType: entity.type,
            id: v4(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_COMMENT_THREAD) ?? '',
        getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
      ],
      onCompleted(data) {
        setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
        setViewableCommentThreadId(data.createOneCommentThread.id);
        setCommentableEntityArray([entity]);
        openRightDrawer(RightDrawerPages.CreateCommentThread);
      },
    });
  };
}
