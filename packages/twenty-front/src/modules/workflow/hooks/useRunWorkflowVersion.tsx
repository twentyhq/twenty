import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { useUpsertFindOneRecordQueryInCache } from '@/object-record/cache/hooks/useUpsertFindOneRecordQueryInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeOptimisticCreateRecordBaseRecordInput } from '@/object-record/utils/computeOptimisticCreateRecordBaseRecordInput';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { RUN_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/runWorkflowVersion';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { useApolloClient, useMutation } from '@apollo/client';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  RunWorkflowVersionMutation,
  RunWorkflowVersionMutationVariables,
} from '~/generated/graphql';

export const useRunWorkflowVersion = () => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
  });
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const createOneRecordInCache = useCreateOneRecordInCache<WorkflowRun>({
    objectMetadataItem,
  });
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItems } = useObjectMetadataItems();

  const [mutate] = useMutation<
    RunWorkflowVersionMutation,
    RunWorkflowVersionMutationVariables
  >(RUN_WORKFLOW_VERSION, {
    client: apolloClient,
  });

  const computedRecordGqlFields = generateDepthOneRecordGqlFields({
    objectMetadataItem,
  });

  const { upsertFindOneRecordQueryInCache } =
    useUpsertFindOneRecordQueryInCache({
      objectMetadataItem,
      recordGqlFields: computedRecordGqlFields,
    });

  const { findOneRecord: findOneWorkflowRun } =
    useLazyFindOneRecord<WorkflowRun>({
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const setRecordInStore = useRecoilCallback(
    ({ set }) =>
      ({ recordId, record }: { recordId: string; record: ObjectRecord }) => {
        set(recordStoreFamilyState(recordId), record);
      },
    [],
  );

  const runWorkflowVersion = async ({
    workflowVersionId,
    payload,
  }: {
    workflowVersionId: string;
    payload?: Record<string, any>;
  }) => {
    const workflowRunId = v4();

    const recordInput: Partial<WorkflowRun> = {
      name: 'Workflow Run',
      status: 'NOT_STARTED',
      output: null,
      context: null,
      workflowVersionId,
      workflowId: workflowVersionId,
      createdAt: new Date().toISOString(),
    };

    const optimisticRecordInput = computeOptimisticRecordFromInput({
      cache: apolloClient.cache,
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

    if (!isDefined(recordCreatedInCache)) {
      throw new Error('Aie aie aie');
    }

    const optimisticRecordNode = getRecordNodeFromRecord({
      objectMetadataItem,
      objectMetadataItems,
      record: recordCreatedInCache,
      recordGqlFields: computedRecordGqlFields,
      computeReferences: false,
    });

    if (optimisticRecordNode !== null) {
      upsertFindOneRecordQueryInCache({
        objectRecordToOverwrite: recordCreatedInCache,
        queryVariables: {
          objectRecordId: workflowRunId,
        },
      });

      setRecordInStore({
        recordId: workflowRunId,
        record: recordCreatedInCache,
      });

      // triggerCreateRecordsOptimisticEffect({
      //   cache: apolloClient.cache,
      //   objectMetadataItem,
      //   recordsToCreate: [optimisticRecordNode],
      //   objectMetadataItems,
      //   shouldMatchRootQueryFilter: true,
      //   objectPermissionsByObjectMetadataId,
      // });
    }

    openRecordInCommandMenu({
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
      recordId: workflowRunId,
    });

    await mutate({
      variables: { input: { workflowVersionId, workflowRunId, payload } },
    });

    // await findOneWorkflowRun({
    //   objectRecordId: workflowRunId,
    //   onCompleted: (workflowRun) => {
    //     openRecordInCommandMenu({
    //       objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    //       recordId: workflowRun.id,
    //     });
    //   },
    // });
  };

  return { runWorkflowVersion };
};
