import { useCallback } from 'react';
import { useStore } from 'jotai';
import { isNonEmptyArray } from '@sniptt/guards';

import { type ActivityForEditor } from '@/activities/types/ActivityForEditor';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

import { createOneActivityOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/createOneActivityOperationSignatureFactory';
import { type ActivityTarget } from '@/activities/types/ActivityTarget';
import { getActivityTargetJunctionConfig } from '@/activities/utils/getActivityTargetJunctionConfig';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const useCreateActivityInDB = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Note;
}) => {
  const createOneActivityOperationSignature =
    createOneActivityOperationSignatureFactory({
      objectNameSingular: activityObjectNameSingular,
    });

  const { createOneRecord: createOneActivity } = useCreateOneRecord({
    objectNameSingular: activityObjectNameSingular,
    recordGqlFields: createOneActivityOperationSignature.fields,
    shouldMatchRootQueryFilter: true,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItem({
      objectNameSingular: activityObjectNameSingular,
    });

  const activityTargetJunctionConfig = getActivityTargetJunctionConfig({
    activityObjectMetadata: objectMetadataItemActivity,
    objectMetadataItems,
  });
  const activityTargetObjectNameSingular =
    activityTargetJunctionConfig?.junctionObjectMetadata.nameSingular ??
    activityObjectNameSingular;
  const activityTargetFieldName =
    activityTargetJunctionConfig?.activityTargetField.name;

  const { createManyRecords: createManyActivityTargets } =
    useCreateManyRecords<ActivityTarget>({
      objectNameSingular: activityTargetObjectNameSingular,
      shouldMatchRootQueryFilter: true,
    });

  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItem({
      objectNameSingular: activityTargetObjectNameSingular,
    });

  const cache = useApolloCoreClient().cache;
  const store = useStore();

  const createActivityInDB = useCallback(
    async (activityToCreate: ActivityForEditor) => {
      const createdActivity = await createOneActivity?.({
        ...activityToCreate,
        updatedAt: new Date().toISOString(),
      });

      if (!isDefined(activityTargetFieldName)) {
        throw new Error('Activity target relation metadata is missing');
      }

      const activityTargetsToCreate =
        (activityToCreate[
          activityTargetFieldName as keyof ActivityForEditor
        ] as ActivityTarget[] | undefined) ?? [];

      if (isNonEmptyArray(activityTargetsToCreate)) {
        await createManyActivityTargets({
          recordsToCreate: activityTargetsToCreate,
        });
      }

      const activityTargetsConnection = getRecordConnectionFromRecords({
        objectMetadataItems,
        objectMetadataItem: objectMetadataItemActivityTarget,
        records: activityTargetsToCreate.map((activityTarget) => ({
          ...activityTarget,
          __typename: capitalize(objectMetadataItemActivityTarget.nameSingular),
        })),
        withPageInfo: false,
        computeReferences: true,
        isRootLevel: false,
      });

      modifyRecordFromCache({
        recordId: createdActivity.id,
        cache,
        fieldModifiers: {
          [activityTargetFieldName]: () => activityTargetsConnection,
        },
        objectMetadataItem: objectMetadataItemActivity,
      });

      store.set(recordStoreFamilyState.atomFamily(createdActivity.id), {
        ...createdActivity,
        [activityTargetFieldName]: activityTargetsToCreate,
      });
    },
    [
      store,
      cache,
      createManyActivityTargets,
      createOneActivity,
      activityTargetFieldName,
      objectMetadataItemActivity,
      objectMetadataItemActivityTarget,
      objectMetadataItems,
    ],
  );

  return {
    createActivityInDB,
  };
};
