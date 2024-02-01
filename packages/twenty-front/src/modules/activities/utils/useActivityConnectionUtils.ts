import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { Comment } from '@/activities/types/Comment';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { useMapConnectionToRecords } from '@/object-record/hooks/useMapConnectionToRecords';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { isDefined } from '~/utils/isDefined';

export const useActivityConnectionUtils = () => {
  const mapConnectionToRecords = useMapConnectionToRecords();

  const makeActivityWithoutConnection = (activityWithConnections: any) => {
    const activityTargets = isDefined(activityWithConnections?.activityTargets)
      ? mapConnectionToRecords({
          objectRecordConnection: activityWithConnections?.activityTargets,
          objectNameSingular: CoreObjectNameSingular.ActivityTarget,
          depth: 5,
        })
      : [];

    const comments = isDefined(activityWithConnections?.comments)
      ? mapConnectionToRecords({
          objectRecordConnection: activityWithConnections?.comments,
          objectNameSingular: CoreObjectNameSingular.Comment,
          depth: 5,
        })
      : [];

    console.log({
      activityWithConnections,
      activityTargets,
      comments,
    });

    const activity: Activity = {
      ...activityWithConnections,
      activityTargets,
      comments,
    };

    return { activity };
  };

  const makeActivityWithConnection = (activity: Activity) => {
    const activityTargets = isDefined(activity?.activityTargets)
      ? ({
          edges: activity.activityTargets.map((activityTarget) => ({
            node: activityTarget,
            cursor: '',
          })),
          pageInfo: getEmptyPageInfo(),
        } as ObjectRecordConnection<ActivityTarget>)
      : undefined;

    const comments = isDefined(activity?.comments)
      ? ({
          edges: activity.comments.map((comment) => ({
            node: comment,
            cursor: '',
          })),
          pageInfo: getEmptyPageInfo(),
        } as ObjectRecordConnection<Comment>)
      : undefined;

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
