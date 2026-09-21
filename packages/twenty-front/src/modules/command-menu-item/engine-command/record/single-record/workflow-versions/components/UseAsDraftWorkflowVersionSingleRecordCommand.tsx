import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { useLingui } from '@lingui/react/macro';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const UseAsDraftWorkflowVersionSingleRecordCommandContent = ({
  workflowId,
  workflowVersionId,
}: {
  workflowId: string;
  workflowVersionId: string;
}) => {
  const isCore = useIsWorkflowCoreEnabled();
  const { t } = useLingui();
  const workflow = useWorkflowWithCurrentVersion(workflowId);
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const navigate = useNavigateApp();

  const hasAlreadyDraftVersion =
    workflow?.versions.some((version) => version.status === 'DRAFT') ?? false;

  const handleExecute = async () => {
    await createDraftFromWorkflowVersion({
      workflowId,
      workflowVersionIdToCopy: workflowVersionId,
    });

    if (isCore) {
      navigate(AppPath.WorkflowCoreShowPage, { coreWorkflowId: workflowId });
      return;
    }
    navigate(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Workflow,
      objectRecordId: workflowId,
    });
  };

  if (!isDefined(workflow)) {
    return null;
  }

  if (!hasAlreadyDraftVersion) {
    return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
  }

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={t`A draft already exists`}
      subtitle={t`A draft already exists for this workflow. Are you sure you want to erase it?`}
      confirmButtonText={t`Override Draft`}
      linkButton={{
        title: t`Go to Draft`,
        to: isCore
          ? getAppPath(AppPath.WorkflowCoreShowPage, {
              coreWorkflowId: workflowId,
            })
          : getAppPath(AppPath.RecordShowPage, {
              objectNameSingular: CoreObjectNameSingular.Workflow,
              objectRecordId: workflowId,
            }),
      }}
      execute={handleExecute}
    />
  );
};

export const UseAsDraftWorkflowVersionSingleRecordCommand = () => {
  const isCore = useIsWorkflowCoreEnabled();
  const { selectedRecords } = useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];
  const { coreWorkflowVersion, loading } = useCoreWorkflowVersion(
    isCore ? selectedRecord?.coreWorkflowVersionId : undefined,
  );

  if (isCore && (loading || !isDefined(coreWorkflowVersion))) {
    return null;
  }

  const workflowId = isCore
    ? coreWorkflowVersion?.coreWorkflowId
    : selectedRecord?.workflowId;
  const workflowVersionId = isCore
    ? coreWorkflowVersion?.id
    : selectedRecord?.id;

  if (!isDefined(workflowId) || !isDefined(workflowVersionId)) {
    throw new Error(
      'Record ID and workflow ID are required to use as draft workflow version',
    );
  }

  return (
    <UseAsDraftWorkflowVersionSingleRecordCommandContent
      workflowId={workflowId}
      workflowVersionId={workflowVersionId}
    />
  );
};
