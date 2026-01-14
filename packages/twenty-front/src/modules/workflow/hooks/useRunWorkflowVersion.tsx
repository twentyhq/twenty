import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { useUpsertFindOneRecordQueryInCache } from '@/object-record/cache/hooks/useUpsertFindOneRecordQueryInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { computeOptimisticCreateRecordBaseRecordInput } from '@/object-record/utils/computeOptimisticCreateRecordBaseRecordInput';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { RUN_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/runWorkflowVersion';
import { type WorkflowRun } from '@/workflow/types/Workflow';
import { useMutation } from '@apollo/client';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  type RunWorkflowVersionMutation,
  type RunWorkflowVersionMutationVariables,
} from '~/generated-metadata/graphql';

export const useRunWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const createOneRecordInCache = useCreateOneRecordInCache<WorkflowRun>({
    objectMetadataItem,
  });
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [mutate] = useMutation<
    RunWorkflowVersionMutation,
    RunWorkflowVersionMutationVariables
  >(RUN_WORKFLOW_VERSION, {
    client: apolloCoreClient,
  });

  const computedRecordGqlFields = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    depth: 1,
  });

  const { upsertFindOneRecordQueryInCache } =
    useUpsertFindOneRecordQueryInCache({
      objectMetadataItem,
      recordGqlFields: computedRecordGqlFields,
    });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const setRecordInStore = useRecoilCallback(
    ({ set }) =>
      (workflowRun: WorkflowRun) => {
        set(recordStoreFamilyState(workflowRun.id), workflowRun);
      },
    [],
  );

  const runWorkflowVersion = async ({
    workflowId,
    workflowVersionId,
    payload,
  }: {
    workflowId: string;
    workflowVersionId: string;
    payload?: Record<string, any>;
  }) => {
    const workflowRunId = v4();

    const recordInput: Partial<WorkflowRun> = {
      name: '#0',
      status: 'NOT_STARTED',
      workflowVersionId,
      workflowId,
      createdAt: new Date().toISOString(),
    };

    const optimisticRecordInput = computeOptimisticRecordFromInput({
      cache: apolloCoreClient.cache,
      currentWorkspaceMember: currentWorkspaceMember,
      objectMetadataItem,
      objectMetadataItems,
      recordInput: {
        ...computeOptimisticCreateRecordBaseRecordInput(objectMetadataItem),
        ...recordInput,
        id: workflowRunId,
      },
      objectPermissionsByObjectMetadataId,
    });

    const recordCreatedInCache = createOneRecordInCache({
      ...optimisticRecordInput,
      id: workflowRunId,
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
      objectRecordId: workflowRunId,
    });

    triggerCreateRecordsOptimisticEffect({
      cache: apolloCoreClient.cache,
      objectMetadataItem,
      recordsToCreate: [recordNodeCreatedInCache],
      objectMetadataItems,
      shouldMatchRootQueryFilter: true,
      objectPermissionsByObjectMetadataId,
      upsertRecordsInStore,
    });

    setRecordInStore(recordCreatedInCache);

    await mutate({
      variables: { input: { workflowVersionId, workflowRunId, payload } },
    });

    openRecordInCommandMenu({
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
      recordId: workflowRunId,
    });
  };

  return { runWorkflowVersion };
};
