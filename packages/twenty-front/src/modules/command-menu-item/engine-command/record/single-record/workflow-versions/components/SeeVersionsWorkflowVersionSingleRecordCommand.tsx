import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useOpenCoreWorkflowVersionsSidePanel } from '@/object-core/workflows/versions/hooks/useOpenCoreWorkflowVersionsSidePanel';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const SeeVersionsWorkflowVersionSingleRecordCommandContent = ({
  workspaceWorkflowId,
  coreWorkflowVersionId,
}: {
  workspaceWorkflowId: string;
  coreWorkflowVersionId: string | undefined;
}) => {
  const isCore = useIsWorkflowCoreEnabled();
  const { openCoreWorkflowVersionsSidePanel } =
    useOpenCoreWorkflowVersionsSidePanel();
  const { coreWorkflowVersion } = useCoreWorkflowVersion(
    isCore ? coreWorkflowVersionId : undefined,
  );
  const workflowId = isCore
    ? coreWorkflowVersion?.coreWorkflowId
    : workspaceWorkflowId;
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  if (isCore) {
    return isDefined(workflowId) ? (
      <HeadlessEngineCommandWrapperEffect
        execute={() => openCoreWorkflowVersionsSidePanel(workflowId)}
      />
    ) : null;
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowVersion }}
      queryParams={{
        filter: {
          workflow: {
            [ViewFilterOperand.IS]: {
              selectedRecordIds: [workflowWithCurrentVersion?.id],
            },
          },
        },
      }}
    />
  );
};

export const SeeVersionsWorkflowVersionSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];

  if (!isDefined(selectedRecord) || !isDefined(selectedRecord.workflowId)) {
    throw new Error(
      'Selected record and workflow ID are required to see versions workflow version',
    );
  }

  return (
    <SeeVersionsWorkflowVersionSingleRecordCommandContent
      workspaceWorkflowId={selectedRecord.workflowId}
      coreWorkflowVersionId={selectedRecord.coreWorkflowVersionId}
    />
  );
};
