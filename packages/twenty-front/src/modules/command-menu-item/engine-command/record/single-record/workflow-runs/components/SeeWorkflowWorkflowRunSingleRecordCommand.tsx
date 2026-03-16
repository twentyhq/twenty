import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useMountedEngineCommandContext } from '@/command-menu-item/engine-command/hooks/useMountedEngineCommandContext';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SeeWorkflowWorkflowRunSingleRecordCommand = () => {
  const { selectedRecords } = useMountedEngineCommandContext();
  const selectedRecord = selectedRecords[0];

  if (!isDefined(selectedRecord) || !isDefined(selectedRecord?.workflow?.id)) {
    return null;
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: selectedRecord.workflow.id,
      }}
    />
  );
};
