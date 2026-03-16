import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SeeVersionWorkflowRunSingleRecordCommand = () => {
  const { selectedRecord } = useEngineCommandExecutionContext();

  if (
    !isDefined(selectedRecord) ||
    !isDefined(selectedRecord?.workflowVersion?.id)
  ) {
    throw new Error('Selected record is required to see version workflow run');
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: selectedRecord.workflowVersion.id,
      }}
    />
  );
};
