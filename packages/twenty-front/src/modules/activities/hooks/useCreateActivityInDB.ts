import { isNonEmptyArray } from '@sniptt/guards';

import { ActivityForEditor } from '@/activities/types/ActivityForEditor';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useApolloClient } from '@apollo/client';

import { createOneActivityOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/createOneActivityOperationSignatureFactory';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { useRecoilCallback } from 'recoil';
import { capitalize } from 'twenty-shared';

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

  const { createManyRecords: createManyActivityTargets } = useCreateManyRecords<
    TaskTarget | NoteTarget
  >({
    objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
    shouldMatchRootQueryFilter: true,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItem({
      objectNameSingular: getJoinObjectNameSingular(activityObjectNameSingular),
    });

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItem({
      objectNameSingular: activityObjectNameSingular,
    });

  const cache = useApolloClient().cache;

  const createActivityInDB = useRecoilCallback(
    ({ set }) =>
      async (activityToCreate: ActivityForEditor) => {
        const createdActivity = await createOneActivity?.({
          ...activityToCreate,
          updatedAt: new Date().toISOString(),
        });

        const activityTargetsToCreate =
          activityToCreate.noteTargets ?? activityToCreate.taskTargets ?? [];

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
