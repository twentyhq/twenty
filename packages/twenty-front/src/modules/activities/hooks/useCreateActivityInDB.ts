import { isNonEmptyArray } from '@sniptt/guards';

import { CREATE_ONE_ACTIVITY_OPERATION_SIGNATURE } from '@/activities/graphql/operation-signatures/CreateOneActivityOperationSignature';
import { ActivityForEditor } from '@/activities/types/ActivityForEditor';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useApolloClient } from '@apollo/client';

import { useRecoilCallback } from 'recoil';
import { capitalize } from '~/utils/string/capitalize';

export const useCreateActivityInDB = () => {
  const { createOneRecord: createOneActivity } = useCreateOneRecord({
    objectNameSingular:
      CREATE_ONE_ACTIVITY_OPERATION_SIGNATURE.objectNameSingular,
    recordGqlFields: CREATE_ONE_ACTIVITY_OPERATION_SIGNATURE.fields,
    shouldMatchRootQueryFilter: true,
  });

  const { createManyRecords: createManyActivityTargets } =
    useCreateManyRecords<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
      shouldMatchRootQueryFilter: true,
    });

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const cache = useApolloClient().cache;

  const createActivityInDB = useRecoilCallback(
    ({ set }) =>
      async (activityToCreate: ActivityForEditor) => {
        const createdActivity = await createOneActivity?.({
          ...activityToCreate,
          updatedAt: new Date().toISOString(),
        });

        const activityTargetsToCreate = activityToCreate.activityTargets ?? [];

        if (isNonEmptyArray(activityTargetsToCreate)) {
          await createManyActivityTargets(activityTargetsToCreate);
        }

        const activityTargetsConnection = getRecordConnectionFromRecords({
          objectMetadataItems,
          objectMetadataItem: objectMetadataItemActivityTarget,
          records: activityTargetsToCreate.map((activityTarget) => ({
            ...activityTarget,
            __typename: capitalize(
              objectMetadataItemActivityTarget.nameSingular,
            ),
          })),
          withPageInfo: false,
          computeReferences: true,
          isRootLevel: false,
        });

        modifyRecordFromCache({
          recordId: createdActivity.id,
          cache,
          fieldModifiers: {
            activityTargets: () => activityTargetsConnection,
          },
          objectMetadataItem: objectMetadataItemActivity,
        });

        set(recordStoreFamilyState(createdActivity.id), {
          ...createdActivity,
          activityTargets: activityTargetsToCreate,
        });
      },
    [
      cache,
      createManyActivityTargets,
      createOneActivity,
      objectMetadataItemActivity,
      objectMetadataItemActivityTarget,
      objectMetadataItems,
    ],
  );

  return {
    createActivityInDB,
  };
};
