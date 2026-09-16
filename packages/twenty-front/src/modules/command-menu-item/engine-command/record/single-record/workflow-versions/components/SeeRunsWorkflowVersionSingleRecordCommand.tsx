import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
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

  const recordId = selectedRecords[0]?.id;
  const selectedRecord = selectedRecords[0];

  const workflowId = isCore
    ? selectedRecord?.workflowId
    : selectedRecord?.workflow?.id;

  if (!isDefined(recordId) || !isDefined(workflowId)) {
    throw new Error(
      'Record ID and workflow ID are required to see runs workflow version',
    );
  }

  return (
    <SeeRunsWorkflowVersionSingleRecordCommandContent
      workflowId={workflowId}
      recordId={recordId}
    />
  );
};
