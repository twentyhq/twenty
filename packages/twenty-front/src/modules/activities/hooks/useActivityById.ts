import { useSetRecoilState } from 'recoil';

import { useActivityConnectionUtils } from '@/activities/utils/useActivityConnectionUtils';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const QUERY_DEPTH_TO_GET_ACTIVITY_TARGET_RELATIONS = 3;

export const useActivityById = ({ activityId }: { activityId: string }) => {
  const setEntityFields = useSetRecoilState(recordStoreFamilyState(activityId));

  const { makeActivityWithoutConnection } = useActivityConnectionUtils();

  const { record: activityWithConnections } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Activity,
    objectRecordId: activityId,
    skip: !activityId,
    onCompleted: (activityWithConnections: any) => {
      const { activity } = makeActivityWithoutConnection(
        activityWithConnections,
      );

      setEntityFields(activity);
    },
    depth: QUERY_DEPTH_TO_GET_ACTIVITY_TARGET_RELATIONS,
  });

  const { activity } = makeActivityWithoutConnection(activityWithConnections);

  return {
    activity,
  };
};
