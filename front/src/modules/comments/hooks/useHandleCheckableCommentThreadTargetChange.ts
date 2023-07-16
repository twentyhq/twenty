import { getOperationName } from '@apollo/client/utilities';
import { v4 } from 'uuid';

import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/services';
import {
  CommentThread,
  CommentThreadTarget,
  useAddCommentThreadTargetOnCommentThreadMutation,
  useRemoveCommentThreadTargetOnCommentThreadMutation,
} from '~/generated/graphql';

import { GET_COMMENT_THREADS_BY_TARGETS } from '../services';
import { CommentableEntityForSelect } from '../types/CommentableEntityForSelect';

export function useHandleCheckableCommentThreadTargetChange({
  commentThread,
}: {
  commentThread?: Pick<CommentThread, 'id'> & {
    commentThreadTargets: Array<
      Pick<CommentThreadTarget, 'id' | 'commentableId'>
    >;
  };
}) {
  const [addCommentThreadTargetOnCommentThread] =
    useAddCommentThreadTargetOnCommentThreadMutation({
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
      ],
    });

  const [removeCommentThreadTargetOnCommentThread] =
    useRemoveCommentThreadTargetOnCommentThreadMutation({
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
      ],
    });

  return function handleCheckItemChange(
    newCheckedValue: boolean,
    entity: CommentableEntityForSelect,
  ) {
    if (!commentThread) {
      return;
    }
    if (newCheckedValue) {
      addCommentThreadTargetOnCommentThread({
        variables: {
          commentableEntityId: entity.id,
          commentableEntityType: entity.entityType,
          commentThreadId: commentThread.id,
          commentThreadTargetCreationDate: new Date().toISOString(),
          commentThreadTargetId: v4(),
        },
      });
    } else {
      const foundCorrespondingTarget = commentThread.commentThreadTargets?.find(
        (target) => target.commentableId === entity.id,
      );

      if (foundCorrespondingTarget) {
        removeCommentThreadTargetOnCommentThread({
          variables: {
            commentThreadId: commentThread.id,
            commentThreadTargetId: foundCorrespondingTarget.id,
          },
        });
      }
    }
  };
}
