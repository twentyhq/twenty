import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const SeeRunsWorkflowVersionSingleRecordCommandContent = ({
  workflowId,
  recordId,
}: {
  workflowId: string;
  recordId: string;
}) => {
  const isCore = useIsWorkflowCoreEnabled();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

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
