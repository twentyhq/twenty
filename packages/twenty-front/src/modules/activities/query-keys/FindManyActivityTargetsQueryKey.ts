import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { QueryKey } from '@/object-record/query-keys/types/QueryKey';

export const FIND_MANY_ACTIVITY_TARGETS_QUERY_KEY: QueryKey = {
  objectNameSingular: CoreObjectNameSingular.ActivityTarget,
  variables: {},
  fieldsFactory: (objectMetadataItems: ObjectMetadataItem[]) => {
    return {
      id: true,
      __typename: true,
      createdAt: true,
      updatedAt: true,
      activity: true,
      activityId: true,
      ...generateActivityTargetMorphFieldKeys(objectMetadataItems),
    };
  },
  depth: 1,
};
