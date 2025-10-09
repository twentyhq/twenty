import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useUpsertFindOneRecordQueryInCache } from '@/object-record/cache/hooks/useUpsertFindOneRecordQueryInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { computeOptimisticCreateRecordBaseRecordInput } from '@/object-record/utils/computeOptimisticCreateRecordBaseRecordInput';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { type Workflow, type WorkflowVersion } from '@/workflow/types/Workflow';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  useCreateDraftFromWorkflowVersionMutation,
  type CreateDraftFromWorkflowVersionInput,
} from '~/generated-metadata/graphql';

export const useCreateDraftFromWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const getWorkflowFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const createOneRecordInCache = useCreateOneRecordInCache<WorkflowVersion>({
    objectMetadataItem,
  });
  const computedRecordGqlFields = generateDepthOneRecordGqlFields({
    objectMetadataItem,
  });

  const { upsertFindOneRecordQueryInCache } =
    useUpsertFindOneRecordQueryInCache({
      objectMetadataItem,
      recordGqlFields: computedRecordGqlFields,
    });
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItems } = useObjectMetadataItems();

  const [mutate] = useCreateDraftFromWorkflowVersionMutation({
    client: apolloCoreClient,
  });

  const createDraftFromWorkflowVersion = async (
    input: CreateDraftFromWorkflowVersionInput,
  ) => {
    const result = await mutate({
      variables: { input },
    });

    const cachedWorkflow = getWorkflowFromCache<Workflow>(input.workflowId);

    if (
      !isDefined(cachedWorkflow) ||
      !isDefined(result.data?.createDraftFromWorkflowVersion) ||
      !isDefined(result.data?.createDraftFromWorkflowVersion.id)
    ) {
      return;
    }

    const newVersion = {
      ...result.data.createDraftFromWorkflowVersion,
      __typename: getObjectTypename(objectMetadataItem.nameSingular),
    };

    apolloCoreClient.cache.modify({
      id: apolloCoreClient.cache.identify(cachedWorkflow),
      fields: {
        versions: () => {
          return [...(cachedWorkflow.versions || []), newVersion];
        },
      },
    });

    const optimisticRecordInput = computeOptimisticRecordFromInput({
      cache: apolloCoreClient.cache,
      currentWorkspaceMember: currentWorkspaceMember,
      objectMetadataItem,
      objectMetadataItems,
      recordInput: {
        ...computeOptimisticCreateRecordBaseRecordInput(objectMetadataItem),
        ...newVersion,
        id: newVersion.id,
      },
      objectPermissionsByObjectMetadataId,
    });

    const recordCreatedInCache = createOneRecordInCache({
      ...optimisticRecordInput,
      id: newVersion.id,
      __typename: getObjectTypename(objectMetadataItem.nameSingular),
    });

    const recordNodeCreatedInCache = getRecordNodeFromRecord({
      objectMetadataItem,
      objectMetadataItems,
      record: recordCreatedInCache,
      computeReferences: false,
    });

    if (!isDefined(recordNodeCreatedInCache)) {
      throw new Error('The record should have been created in cache');
    }

    upsertFindOneRecordQueryInCache({
      objectRecordToOverwrite: recordCreatedInCache,
      objectRecordId: newVersion.id,
    });

    triggerCreateRecordsOptimisticEffect({
      cache: apolloCoreClient.cache,
      objectMetadataItem,
      recordsToCreate: [recordNodeCreatedInCache],
      objectMetadataItems,
      shouldMatchRootQueryFilter: true,
      objectPermissionsByObjectMetadataId,
    });

    return result?.data?.createDraftFromWorkflowVersion.id;
  };

  return {
    createDraftFromWorkflowVersion,
  };
};
