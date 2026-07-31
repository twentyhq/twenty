import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
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
        to: getAppPath(AppPath.RecordShowPage, {
          objectNameSingular: CoreObjectNameSingular.Workflow,
          objectRecordId: workflowId,
        }),
      }}
      execute={handleExecute}
    />
  );
};

export const UseAsDraftWorkflowVersionSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];

  if (!isDefined(selectedRecord) || !isDefined(selectedRecord.workflowId)) {
    throw new Error(
      'Record ID and workflow ID are required to use as draft workflow version',
    );
  }

  return (
    <UseAsDraftWorkflowVersionSingleRecordCommandContent
      workflowId={selectedRecord.workflowId}
      workflowVersionId={selectedRecord.id}
    />
  );
};
