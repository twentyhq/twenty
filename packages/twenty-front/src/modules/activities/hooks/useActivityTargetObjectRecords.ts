import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { ActivityTargetObjectRecord } from '@/activities/types/ActivityTargetObject';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Nullable } from '~/types/Nullable';
import { isDefined } from '~/utils/isDefined';

export const useActivityTargetObjectRecords = ({
  activityTargetIds,
}: {
  activityTargetIds: string[];
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { records: activityTargets } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    filter: {
      id: {
        in: activityTargetIds,
      },
    },
  });

  const activityTargetObjectRecords = useMemo(() => {
    return activityTargets
      .map<Nullable<ActivityTargetObjectRecord>>((activityTarget) => {
        const correspondingObjectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            isDefined(activityTarget[objectMetadataItem.nameSingular]),
        );

        if (!correspondingObjectMetadataItem) {
          return null;
        }

        return {
          activityTargetRecord: activityTarget,
          targetObjectRecord:
            activityTarget[correspondingObjectMetadataItem.nameSingular],
          targetObjectMetadataItem: correspondingObjectMetadataItem,
        };
      })
      .filter(isDefined);
  }, [activityTargets, objectMetadataItems]);

  return {
    activityTargetObjectRecords,
  };
};
