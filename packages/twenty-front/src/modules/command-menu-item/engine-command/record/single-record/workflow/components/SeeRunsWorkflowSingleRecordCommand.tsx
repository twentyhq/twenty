import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SeeRunsWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const workflowName = selectedRecords[0]?.name;

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to see runs workflow');
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
      queryParams={{
        filter: { coreWorkflowId: { [ViewFilterOperand.IS]: recordId } },
        filterDisplayValue: {
          coreWorkflowId: { [ViewFilterOperand.IS]: workflowName },
        },
      }}
    />
  );
};
