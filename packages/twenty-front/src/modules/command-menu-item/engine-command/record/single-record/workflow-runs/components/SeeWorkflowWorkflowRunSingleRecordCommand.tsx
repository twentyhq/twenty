import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SeeWorkflowWorkflowRunSingleRecordCommand = () => {
  const isCore = useIsWorkflowCoreEnabled();
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];
  const navigateApp = useNavigateApp();

  const { findOneRecord: findWorkflowRun } = useLazyFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    recordGqlFields: { id: true, coreWorkflowId: true },
  });

  const findCoreWorkflowId = async (): Promise<string | null | undefined> => {
    if (!isDefined(selectedRecord?.id)) {
      return undefined;
    }

    if (isDefined(selectedRecord.coreWorkflowId)) {
      return selectedRecord.coreWorkflowId;
    }

    let coreWorkflowId: string | null | undefined;

    await findWorkflowRun({
      objectRecordId: selectedRecord.id,
      onCompleted: (workflowRun) => {
        coreWorkflowId = workflowRun.coreWorkflowId;
      },
    });

    return coreWorkflowId;
  };

  if (isCore) {
    return (
      <HeadlessEngineCommandWrapperEffect
        execute={async () => {
          const coreWorkflowId = await findCoreWorkflowId();

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
