import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

const QUERY_DEPTH_TO_GET_ACTIVITY_TARGET_RELATIONS = 3;

export const useActivityById = ({ activityId }: { activityId: string }) => {
  const { record: activity, loading } = useFindOneRecord<Activity>({
    objectNameSingular: CoreObjectNameSingular.Activity,
    objectRecordId: activityId,
    skip: !activityId,
    depth: QUERY_DEPTH_TO_GET_ACTIVITY_TARGET_RELATIONS,
  });

  return {
    activity,
    loading,
  };
};
