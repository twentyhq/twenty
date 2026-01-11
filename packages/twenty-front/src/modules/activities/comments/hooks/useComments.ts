import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { findCommentTargetsOperationSignatureFactory } from '@/activities/comments/graphql/operation-signatures/factories/findCommentTargetsOperationSignatureFactory';
import { currentCommentsQueryVariablesState } from '@/activities/comments/states/currentCommentsQueryVariablesState';
import { type Comment } from '@/activities/comments/types/Comment';
import { type CommentTarget } from '@/activities/comments/types/CommentTarget';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline-activities/constants/FindManyTimelineActivitiesOrderBy';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useComments = (targetableObject: ActivityTargetableObject) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const commentsQueryVariables = useMemo(
    () =>
      ({
        orderBy: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
      }) as RecordGqlOperationVariables,
    [],
  );

  const commentTargetsFilter = getActivityTargetsFilter({
    targetableObjects: [targetableObject],
    activityObjectNameSingular: CoreObjectNameSingular.Comment,
    objectMetadataItems,
  });

  const FIND_COMMENT_TARGETS_OPERATION_SIGNATURE =
    findCommentTargetsOperationSignatureFactory({
      objectMetadataItems,
    });

  const updateCommentsInStore = useRecoilCallback(
    ({ set }) =>
      (commentTargets: CommentTarget[]) => {
        for (const commentTarget of commentTargets) {
          const comment = commentTarget.comment;
          set(recordStoreFamilyState(comment.id), comment);
        }
      },
    [],
  );

  const {
    records: commentTargets,
    loading: loadingCommentTargets,
    totalCount: totalCountCommentTargets,
    fetchMoreRecords: fetchMoreCommentTargets,
    hasNextPage,
  } = useFindManyRecords<CommentTarget>({
    objectNameSingular:
      FIND_COMMENT_TARGETS_OPERATION_SIGNATURE.objectNameSingular,
    filter: commentTargetsFilter,
    recordGqlFields: FIND_COMMENT_TARGETS_OPERATION_SIGNATURE.fields,
    onCompleted: updateCommentsInStore,
    orderBy: commentsQueryVariables.orderBy,
    limit: 10,
  });

  const comments = commentTargets.map(
    (commentTarget) => commentTarget.comment,
  ) as Comment[];

  const fetchMoreComments = async () => {
    const result = await fetchMoreCommentTargets();

    if (!isDefined(result?.data)) {
      return [];
    }

    const newCommentTargets = getRecordsFromRecordConnection<CommentTarget>({
      recordConnection: result.data,
    });

    updateCommentsInStore(newCommentTargets);

    return newCommentTargets.map(
      (commentTarget) => commentTarget.comment,
    ) as Comment[];
  };

  const [currentCommentsQueryVariables, setCurrentCommentsQueryVariables] =
    useRecoilState(currentCommentsQueryVariablesState);

  // TODO: fix useEffect, remove with better pattern
  useEffect(() => {
    if (!isDeeplyEqual(commentsQueryVariables, currentCommentsQueryVariables)) {
      setCurrentCommentsQueryVariables(commentsQueryVariables);
    }
  }, [
    commentsQueryVariables,
    currentCommentsQueryVariables,
    setCurrentCommentsQueryVariables,
  ]);

  return {
    comments,
    loading: loadingCommentTargets,
    totalCountComments: totalCountCommentTargets ?? 0,
    fetchMoreComments,
    hasNextPage,
  };
};
