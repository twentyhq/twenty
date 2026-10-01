import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useFindSelectedWorkflowRunCoreId } from '@/command-menu-item/engine-command/record/single-record/workflow-runs/hooks/useFindSelectedWorkflowRunCoreId';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SeeWorkflowWorkflowRunSingleRecordCommand = () => {
  const isCore = useIsWorkflowCoreEnabled();
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];
  const navigateApp = useNavigateApp();
  const { findSelectedWorkflowRunCoreId } =
    useFindSelectedWorkflowRunCoreId('coreWorkflowId');

  if (isCore) {
    return (
      <HeadlessEngineCommandWrapperEffect
        execute={async () => {
          const coreWorkflowId = await findSelectedWorkflowRunCoreId();

          if (!isDefined(coreWorkflowId)) {
            return;
          }

          navigateApp(AppPath.WorkflowCoreShowPage, { coreWorkflowId });
        }}
      />
    );
  }

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
