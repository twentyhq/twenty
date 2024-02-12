import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { ActivityTargetObjectRecord } from '@/activities/types/ActivityTargetObject';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Nullable } from '~/types/Nullable';
import { isDefined } from '~/utils/isDefined';

export const useActivityTargetObjectRecords = ({
  activityId,
}: {
  activityId: string;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { records: activityTargets, loading: loadingActivityTargets } =
    useFindManyRecords({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
      skip: !isNonEmptyString(activityId),
      filter: {
        activityId: {
          eq: activityId,
        },
      },
    });

  const activityTargetObjectRecords = activityTargets
    .map<Nullable<ActivityTargetObjectRecord>>((activityTarget) => {
      const correspondingObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          isDefined(activityTarget[objectMetadataItem.nameSingular]) &&
          !objectMetadataItem.isSystem,
      );

      if (!correspondingObjectMetadataItem) {
        return null;
      }

      return {
        activityTargetRecord: activityTarget,
        targetObjectRecord:
          activityTarget[correspondingObjectMetadataItem.nameSingular],
        targetObjectMetadataItem: correspondingObjectMetadataItem,
        targetObjectNameSingular: correspondingObjectMetadataItem.nameSingular,
      };
    })
    .filter(isDefined);

  return {
    activityTargetObjectRecords,
    loadingActivityTargets,
  };
};
