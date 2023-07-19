import { getOperationName } from '@apollo/client/utilities/graphql/getFromAST';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/queries';
import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { useOpenRightDrawer } from '@/ui/right-drawer/hooks/useOpenRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/right-drawer/types/RightDrawerPages';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import {
  ActivityType,
  CommentableType,
  useCreateCommentThreadMutation,
} from '~/generated/graphql';

import { GET_COMMENT_THREAD, GET_COMMENT_THREADS_BY_TARGETS } from '../queries';
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

  const setHotkeyScope = useSetHotkeyScope();

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
        type: ActivityType.Note,
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
        setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
        setViewableCommentThreadId(data.createOneCommentThread.id);
        setCommentableEntityArray(commentableEntityArray);
        openRightDrawer(RightDrawerPages.CreateCommentThread);
      },
    });
  };
}
