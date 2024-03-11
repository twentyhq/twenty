import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Nullable } from '~/types/Nullable';
import { isNonNullable } from '~/utils/isNonNullable';

export const useActivityTargetObjectRecords = ({
  activityId,
}: {
  activityId: string;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState());

  const { records: activityTargets, loading: loadingActivityTargets } =
    useFindManyRecords<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
      skip: !isNonEmptyString(activityId),
      filter: {
        activityId: {
          eq: activityId,
        },
      },
    });

  const activityTargetObjectRecords = activityTargets
    .map<Nullable<ActivityTargetWithTargetRecord>>((activityTarget) => {
      const correspondingObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          isNonNullable(activityTarget[objectMetadataItem.nameSingular]) &&
          !objectMetadataItem.isSystem,
      );

      if (!correspondingObjectMetadataItem) {
        return null;
      }

      return {
        activityTarget: activityTarget,
        targetObject:
          activityTarget[correspondingObjectMetadataItem.nameSingular],
        targetObjectMetadataItem: correspondingObjectMetadataItem,
        targetObjectNameSingular: correspondingObjectMetadataItem.nameSingular,
      };
    })
    .filter(isNonNullable);

  return {
    activityTargetObjectRecords,
    loadingActivityTargets,
  };
};
