import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SeeRunsWorkflowSingleRecordCommand = () => {
  const isCore = useIsWorkflowCoreEnabled();
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId ?? '',
  );

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to see runs workflow');
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
      queryParams={{
        filter: isCore
          ? { coreWorkflowId: { [ViewFilterOperand.IS]: recordId } }
          : {
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
