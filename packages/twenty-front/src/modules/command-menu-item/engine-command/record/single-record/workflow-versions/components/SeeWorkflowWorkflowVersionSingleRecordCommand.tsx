import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useMountedCommandState } from '@/command-menu-item/engine-command/hooks/useMountedCommandState';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SeeWorkflowWorkflowVersionSingleRecordCommand = () => {
  const { selectedRecords } = useMountedCommandState();
  const selectedRecord = selectedRecords[0];

  if (!isDefined(selectedRecord) || !isDefined(selectedRecord?.workflow?.id)) {
    throw new Error(
      'Selected record and workflow ID are required to see workflow workflow version',
    );
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
