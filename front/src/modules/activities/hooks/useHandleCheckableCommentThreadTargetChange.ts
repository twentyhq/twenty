import { getOperationName } from '@apollo/client/utilities';
import { v4 } from 'uuid';

import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/queries';
import {
  CommentThread,
  CommentThreadTarget,
  useAddCommentThreadTargetsOnCommentThreadMutation,
  useRemoveCommentThreadTargetsOnCommentThreadMutation,
} from '~/generated/graphql';

import { GET_COMMENT_THREADS_BY_TARGETS } from '../queries';
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
  const [addCommentThreadTargetsOnCommentThread] =
    useAddCommentThreadTargetsOnCommentThreadMutation({
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
      ],
    });

  const [removeCommentThreadTargetsOnCommentThread] =
    useRemoveCommentThreadTargetsOnCommentThreadMutation({
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
      ],
    });

  return async function handleCheckItemsChange(
    entityValues: Record<string, boolean>,
    entities: CommentableEntityForSelect[],
  ) {
    if (!commentThread) {
      return;
    }

    const currentEntityIds = commentThread.commentThreadTargets.map(
      ({ commentableId }) => commentableId,
    );

    const entitiesToAdd = entities.filter(
      ({ id }) => entityValues[id] && !currentEntityIds.includes(id),
    );

    if (entitiesToAdd.length)
      await addCommentThreadTargetsOnCommentThread({
        variables: {
          commentThreadId: commentThread.id,
          commentThreadTargetInputs: entitiesToAdd.map((entity) => ({
            id: v4(),
            createdAt: new Date().toISOString(),
            commentableType: entity.entityType,
            commentableId: entity.id,
          })),
        },
      });

    const commentThreadTargetIdsToDelete = commentThread.commentThreadTargets
      .filter(({ commentableId }) => !entityValues[commentableId])
      .map(({ id }) => id);

    if (commentThreadTargetIdsToDelete.length)
      await removeCommentThreadTargetsOnCommentThread({
        variables: {
          commentThreadId: commentThread.id,
          commentThreadTargetIds: commentThreadTargetIdsToDelete,
        },
      });
  };
}
