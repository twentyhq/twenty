import { useQuery } from '@apollo/client/react';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { GetCoreWorkflowDocument } from '~/generated/graphql';

const SeeRunsWorkflowVersionSingleRecordCommandContent = ({
  workflowId,
  recordId,
}: {
  workflowId: string;
  recordId: string;
}) => {
  const isCore = useIsWorkflowCoreEnabled();
  const apolloCoreClient = useApolloCoreClient();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);
  const { coreWorkflowVersion } = useCoreWorkflowVersion(
    isCore ? recordId : undefined,
  );
  const { data: coreWorkflowData, loading: coreWorkflowLoading } = useQuery(
    GetCoreWorkflowDocument,
    {
      client: apolloCoreClient,
      variables: { coreWorkflowId: workflowId },
      skip: !isCore,
    },
  );

  if (coreWorkflowLoading) {
    return null;
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
      queryParams={{
        filter: isCore
          ? {
              coreWorkflowId: { [ViewFilterOperand.IS]: workflowId },
              coreWorkflowVersionId: { [ViewFilterOperand.IS]: recordId },
            }
          : {
              workflow: {
                [ViewFilterOperand.IS]: {
                  selectedRecordIds: [workflowWithCurrentVersion?.id],
                },
              },
              recordStore: {
                [ViewFilterOperand.IS]: {
                  selectedRecordIds: [recordId],
                },
              },
            },
        filterDisplayValue: isCore
          ? {
              coreWorkflowId: {
                [ViewFilterOperand.IS]: coreWorkflowData?.coreWorkflow?.name,
              },
              coreWorkflowVersionId: {
                [ViewFilterOperand.IS]: coreWorkflowVersion?.label,
              },
            }
          : undefined,
      }}
    />
  );
};

export const SeeRunsWorkflowVersionSingleRecordCommand = () => {
  const isCore = useIsWorkflowCoreEnabled();
  const { selectedRecords } = useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];
  const workspaceWorkflowVersionId = selectedRecord?.id;
  const workspaceWorkflowId = selectedRecord?.workflow?.id;
  const { coreWorkflowVersion, loading } = useCoreWorkflowVersion(
    isCore ? selectedRecord?.coreWorkflowVersionId : undefined,
  );

  if (isCore && (loading || !isDefined(coreWorkflowVersion))) {
    return null;
  }

  const workflowId = isCore
    ? coreWorkflowVersion?.coreWorkflowId
    : workspaceWorkflowId;
  const workflowVersionId = isCore
    ? coreWorkflowVersion?.id
    : workspaceWorkflowVersionId;

  if (!isDefined(workflowVersionId) || !isDefined(workflowId)) {
    throw new Error(
      'Record ID and workflow ID are required to see runs workflow version',
    );
  }

  return (
    <SeeRunsWorkflowVersionSingleRecordCommandContent
      workflowId={workflowId}
      recordId={workflowVersionId}
    />
  );
};
