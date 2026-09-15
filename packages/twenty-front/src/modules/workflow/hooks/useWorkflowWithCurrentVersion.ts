import { useCoreWorkflowForShowPage } from '@/object-core/workflows/hooks/useCoreWorkflowForShowPage';
import { useCoreWorkflowVersionContent } from '@/object-core/workflows/hooks/useCoreWorkflowVersionContent';
import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { GetCoreWorkflowByIdDocument } from '~/generated/graphql';
import { useEffectiveDraftVersionId } from '@/workflow/hooks/useEffectiveDraftVersionId';
import {
  type Workflow,
  type WorkflowVersion,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type WorkflowWithAllVersions = Omit<Workflow, 'versions'> & {
  versions: Array<
    Pick<WorkflowVersion, 'id' | 'status' | 'name' | 'createdAt'>
  >;
};

export const useWorkflowWithCurrentVersion = (
  workflowId: string | undefined,
): WorkflowWithCurrentVersion | undefined => {
  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const apolloCoreClient = useApolloCoreClient();

  const { data: coreWorkflowByIdData } = useQuery(GetCoreWorkflowByIdDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-only',
    variables: { coreWorkflowId: workflowId ?? '' },
    skip: !isDefined(workflowId),
  });

  const workspaceWorkflowIdFromCore =
    coreWorkflowByIdData?.coreWorkflowById?.workspaceWorkflowId;

  const effectiveWorkflowId = isNonEmptyString(workspaceWorkflowIdFromCore)
    ? workspaceWorkflowIdFromCore
    : workflowId;

  const { record: workspaceWorkflow } =
    useFindOneRecord<WorkflowWithAllVersions>({
      objectNameSingular: CoreObjectNameSingular.Workflow,
      objectRecordId: effectiveWorkflowId,
      recordGqlFields: {
        id: true,
        name: true,
        statuses: true,
        lastPublishedVersionId: true,
        versions: {
          id: true,
          status: true,
          name: true,
          createdAt: true,
        },
      },
      skip: !isDefined(effectiveWorkflowId) || isWorkflowCoreIndexPageEnabled,
    });

  const {
    coreWorkflow,
    versions: coreVersions,
    draftVersionIdFromServer,
  } = useCoreWorkflowForShowPage({
    workspaceWorkflowId: effectiveWorkflowId,
    skip: !isWorkflowCoreIndexPageEnabled,
  });

  const workflow = isWorkflowCoreIndexPageEnabled
    ? coreWorkflow
    : workspaceWorkflow;

  const allVersions = isWorkflowCoreIndexPageEnabled
    ? coreVersions
    : (workspaceWorkflow?.versions ?? []);

  const coreDraftVersion = isDefined(draftVersionIdFromServer)
    ? { id: draftVersionIdFromServer }
    : undefined;

  const workspaceDraftVersion = workspaceWorkflow?.versions.find(
    (version) => version.status === 'DRAFT',
  );

  const draftVersionFromServer = isWorkflowCoreIndexPageEnabled
    ? coreDraftVersion
    : workspaceDraftVersion;

  const { effectiveDraftId, lastDiscardedDraftId } = useEffectiveDraftVersionId(
    draftVersionFromServer,
  );

  const workflowVersions = [...allVersions]
    .filter((version) => version.id !== lastDiscardedDraftId)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  const currentVersionId = effectiveDraftId ?? workflowVersions[0]?.id;

  const { record: workspaceCurrentVersion } = useFindOneRecord<WorkflowVersion>(
    {
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      objectRecordId: currentVersionId,
      recordGqlFields: {
        id: true,
        name: true,
        status: true,
        workflowId: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: !isDefined(currentVersionId) || isWorkflowCoreIndexPageEnabled,
    },
  );

  const coreCurrentVersion = useCoreWorkflowVersionContent({
    workspaceWorkflowId: effectiveWorkflowId,
    workspaceWorkflowVersionId: currentVersionId,
    skip: !isWorkflowCoreIndexPageEnabled,
  });

  const currentVersion = isWorkflowCoreIndexPageEnabled
    ? coreCurrentVersion
    : workspaceCurrentVersion;

  if (!isDefined(workflow) || !isDefined(currentVersion)) {
    return undefined;
  }

  return {
    ...workflow,
    __typename: 'Workflow',
    versions: workflowVersions,
    currentVersion,
  };
};
