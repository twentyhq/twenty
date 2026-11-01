import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
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

    navigate(AppPath.WorkflowCoreShowPage, { coreWorkflowId: workflowId });
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
        to: getAppPath(AppPath.WorkflowCoreShowPage, {
          coreWorkflowId: workflowId,
        }),
      }}
      execute={handleExecute}
    />
  );
};

export const UseAsDraftWorkflowVersionSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const { coreWorkflowVersion, loading } = useCoreWorkflowVersion(
    selectedRecords[0]?.coreWorkflowVersionId,
  );

  if (loading || !isDefined(coreWorkflowVersion)) {
    return null;
  }

  if (!isDefined(coreWorkflowVersion.coreWorkflowId)) {
    throw new Error(
      doNotTranslate(
        'Record ID and workflow ID are required to use as draft workflow version',
      ),
    );
  }

  return (
    <UseAsDraftWorkflowVersionSingleRecordCommandContent
      workflowId={coreWorkflowVersion.coreWorkflowId}
      workflowVersionId={coreWorkflowVersion.id}
    />
  );
};
