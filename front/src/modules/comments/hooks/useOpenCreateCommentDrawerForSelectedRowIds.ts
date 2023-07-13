import { getOperationName } from '@apollo/client/utilities/graphql/getFromAST';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/services';
import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { GET_PEOPLE } from '@/people/services';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { selectedRowIdsSelector } from '@/ui/tables/states/selectedRowIdsSelector';
import {
  CommentableType,
  useCreateCommentThreadMutation,
} from '~/generated/graphql';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import {
  GET_COMMENT_THREAD,
  GET_COMMENT_THREADS_BY_TARGETS,
} from '../services';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { viewableCommentThreadIdState } from '../states/viewableCommentThreadIdState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenCreateCommentThreadDrawerForSelectedRowIds() {
  const openRightDrawer = useOpenRightDrawer();
  const [createCommentThreadMutation] = useCreateCommentThreadMutation();
  const currentUser = useRecoilValue(currentUserState);
  const [, setViewableCommentThreadId] = useRecoilState(
    viewableCommentThreadIdState,
  );
  const setHotkeysScope = useSetHotkeysScope();

  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );

  const selectedEntityIds = useRecoilValue(selectedRowIdsSelector);

  return function openCreateCommentDrawerForSelectedRowIds(
    entityType: CommentableType,
  ) {
    const commentableEntityArray: CommentableEntity[] = selectedEntityIds.map(
      (id) => ({
        type: entityType,
        id,
      }),
    );

    createCommentThreadMutation({
      variables: {
        authorId: currentUser?.id ?? '',
        commentThreadId: v4(),
        createdAt: new Date().toISOString(),
        commentThreadTargetArray: commentableEntityArray.map((entity) => ({
          commentableId: entity.id,
          commentableType: entity.type,
          id: v4(),
          createdAt: new Date().toISOString(),
        })),
      },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_COMMENT_THREAD) ?? '',
        getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
      ],
      onCompleted(data) {
        setHotkeysScope(InternalHotkeysScope.RightDrawer, { goto: false });
        setViewableCommentThreadId(data.createOneCommentThread.id);
        setCommentableEntityArray(commentableEntityArray);
        openRightDrawer(RightDrawerPages.CreateCommentThread);
      },
    });
  };
}
