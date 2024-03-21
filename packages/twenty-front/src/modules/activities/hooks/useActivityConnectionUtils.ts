import { isNonEmptyArray } from '@apollo/client/utilities';

import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { Comment } from '@/activities/types/Comment';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';

export const useActivityConnectionUtils = () => {
  const makeActivityWithConnection = (activity: Activity) => {
    const activityTargetEdges = isNonEmptyArray(activity?.activityTargets)
      ? activity.activityTargets.map((activityTarget) => ({
          node: activityTarget,
          cursor: '',
        }))
      : [];

    const commentEdges = isNonEmptyArray(activity?.comments)
      ? activity.comments.map((comment) => ({
          node: comment,
          cursor: '',
        }))
      : [];

    const activityTargets = {
      __typename: 'ActivityTargetConnection',
      edges: activityTargetEdges,
      pageInfo: getEmptyPageInfo(),
    } as ObjectRecordConnection<ActivityTarget>;

    const comments = {
      __typename: 'CommentConnection',
      edges: commentEdges,
      pageInfo: getEmptyPageInfo(),
    } as ObjectRecordConnection<Comment>;

    const activityWithConnection = {
      ...activity,
      activityTargets,
      comments,
    } as Activity & {
      activityTargets: ObjectRecordConnection<ActivityTarget>;
      comments: ObjectRecordConnection<Comment>;
    };

    return { activityWithConnection };
  };

  return {
    makeActivityWithConnection,
  };
};
