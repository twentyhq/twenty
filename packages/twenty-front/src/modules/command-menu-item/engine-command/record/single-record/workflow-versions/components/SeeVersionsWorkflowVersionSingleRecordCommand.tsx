import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const SeeVersionsWorkflowVersionSingleRecordCommandContent = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

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
  const { selectedRecord } = useEngineCommandExecutionContext();

  if (!isDefined(selectedRecord) || !isDefined(selectedRecord.workflowId)) {
    throw new Error(
      'Selected record and workflow ID are required to see versions workflow version',
    );
  }

  return (
    <SeeVersionsWorkflowVersionSingleRecordCommandContent
      workflowId={selectedRecord.workflowId}
    />
  );
};
