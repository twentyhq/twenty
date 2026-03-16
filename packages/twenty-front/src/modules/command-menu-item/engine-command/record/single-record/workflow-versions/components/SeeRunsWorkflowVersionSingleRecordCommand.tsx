import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
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
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
      queryParams={{
        filter: {
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
  const { recordId, selectedRecord } = useEngineCommandExecutionContext();

  const workflowId = selectedRecord?.workflow?.id;

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
