import { v4 } from 'uuid';

import {
  useAddCommentThreadTargetOnCommentThreadMutation,
  useRemoveCommentThreadTargetOnCommentThreadMutation,
} from '~/generated/graphql';

import { EntityForSelect } from '../components/MultipleEntitySelect';
import { CommentThreadForDrawer } from '../types/CommentThreadForDrawer';

export function useHandleCheckableCommentThreadTargetChange({
  commentThread,
}: {
  commentThread: CommentThreadForDrawer;
}) {
  const [addCommentThreadTargetOnCommentThread] =
    useAddCommentThreadTargetOnCommentThreadMutation({
      refetchQueries: ['GetCompanies', 'GetPeople'],
    });

  const [removeCommentThreadTargetOnCommentThread] =
    useRemoveCommentThreadTargetOnCommentThreadMutation({
      refetchQueries: ['GetCompanies', 'GetPeople'],
    });

  return function handleCheckItemChange(
    newCheckedValue: boolean,
    entity: EntityForSelect,
  ) {
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
