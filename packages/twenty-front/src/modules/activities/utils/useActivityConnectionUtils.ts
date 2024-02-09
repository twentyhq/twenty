import { isNonEmptyArray } from '@apollo/client/utilities';

import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { Comment } from '@/activities/types/Comment';
import { isObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isObjectRecordConnection';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { useMapConnectionToRecords } from '@/object-record/hooks/useMapConnectionToRecords';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { isDefined } from '~/utils/isDefined';

export const useActivityConnectionUtils = () => {
  const mapConnectionToRecords = useMapConnectionToRecords();

  const makeActivityWithoutConnection = (activityWithConnections: any) => {
    if (!isDefined(activityWithConnections)) {
      return { activity: null };
    }

    const hasActivityTargetsConnection = isObjectRecordConnection(
      CoreObjectNameSingular.ActivityTarget,
      activityWithConnections?.activityTargets,
    );

    const activityTargets: ActivityTarget[] = [];

    if (hasActivityTargetsConnection) {
      const newActivityTargets = mapConnectionToRecords({
        objectRecordConnection: activityWithConnections?.activityTargets,
        objectNameSingular: CoreObjectNameSingular.ActivityTarget,
        depth: 5,
      }) as ActivityTarget[];

      activityTargets.push(...newActivityTargets);
    }

    const hasCommentsConnection = isObjectRecordConnection(
      CoreObjectNameSingular.Comment,
      activityWithConnections?.comments,
    );

    const comments: Comment[] = [];

    if (hasCommentsConnection) {
      const newComments = mapConnectionToRecords({
        objectRecordConnection: activityWithConnections?.comments,
        objectNameSingular: CoreObjectNameSingular.Comment,
        depth: 5,
      }) as Comment[];

      comments.push(...newComments);
    }

    const activity: Activity = {
      ...activityWithConnections,
      activityTargets,
      comments,
    };

    return { activity };
  };

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
      edges: activityTargetEdges,
      pageInfo: getEmptyPageInfo(),
    } as ObjectRecordConnection<ActivityTarget>;

    const comments = {
      edges: commentEdges,
      pageInfo: getEmptyPageInfo(),
    } as ObjectRecordConnection<Comment>;

    const activityWithConnection = {
      ...activity,
      activityTargets,
      comments,
    };

    return { activityWithConnection };
  };

  return {
    makeActivityWithoutConnection,
    makeActivityWithConnection,
  };
};
