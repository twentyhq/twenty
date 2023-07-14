import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/services';
import { useSetHotkeyScope } from '@/lib/hotkeys/hooks/useSetHotkeyScope';
import { GET_PEOPLE } from '@/people/services';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useCreateCommentThreadMutation } from '~/generated/graphql';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import {
  GET_COMMENT_THREAD,
  GET_COMMENT_THREADS_BY_TARGETS,
} from '../services';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { viewableCommentThreadIdState } from '../states/viewableCommentThreadIdState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenCreateCommentThreadDrawer() {
  const openRightDrawer = useOpenRightDrawer();
  const [createCommentThreadMutation] = useCreateCommentThreadMutation();
  const currentUser = useRecoilValue(currentUserState);
  const setHotkeysScope = useSetHotkeyScope();

  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );
  const [, setViewableCommentThreadId] = useRecoilState(
    viewableCommentThreadIdState,
  );

  return function openCreateCommentThreadDrawer(entity: CommentableEntity) {
    createCommentThreadMutation({
      variables: {
        authorId: currentUser?.id ?? '',
        commentThreadId: v4(),
        createdAt: new Date().toISOString(),
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
        setHotkeysScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
        setViewableCommentThreadId(data.createOneCommentThread.id);
        setCommentableEntityArray([entity]);
        openRightDrawer(RightDrawerPages.CreateCommentThread);
      },
    });
  };
}
