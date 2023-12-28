import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getTargetableObjectFilterFieldName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useActivityTargets = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const targetObjectFieldName = getTargetableObjectFilterFieldName({
    targetableObject,
  });

  const { records: activityTargets } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    filter: {
      [targetObjectFieldName]: {
        eq: targetableObject.id,
      },
    },
  });

  return {
    activityTargets: activityTargets as ActivityTarget[],
  };
};
