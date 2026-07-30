import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID } from '@/workflow/constants/OverrideWorkflowDraftConfirmationModalId';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { overrideWorkflowDraftConfirmationModalConfigState } from '@/workflow/states/overrideWorkflowDraftConfirmationModalConfigState';
import { type Workflow, type WorkflowVersion } from '@/workflow/types/Workflow';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type WorkflowWithVersionStatuses = Pick<Workflow, 'id' | '__typename'> & {
  versions: Array<Pick<WorkflowVersion, 'id' | 'status'>>;
};

const UseAsDraftWorkflowVersionSingleRecordCommandContent = ({
  workflowId,
  workflowVersionId,
}: {
  workflowId: string;
  workflowVersionId: string;
}) => {
  const { openModal } = useModal();

  // Only the version statuses are needed, so the workflow is fetched directly
  // rather than through useWorkflowWithCurrentVersion, which stays undefined
  // until the current version and all of its steps have loaded too
  const { record: workflow, loading } =
    useFindOneRecord<WorkflowWithVersionStatuses>({
      objectNameSingular: CoreObjectNameSingular.Workflow,
      objectRecordId: workflowId,
      recordGqlFields: {
        id: true,
        versions: {
          id: true,
          status: true,
        },
      },
    });

  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const navigate = useNavigateApp();

  const setOverrideWorkflowDraftConfirmationModalConfig = useSetAtomState(
    overrideWorkflowDraftConfirmationModalConfigState,
  );

  const handleExecute = async () => {
    if (!isDefined(workflow)) {
      throw new Error(
        `Workflow ${workflowId} could not be loaded to use one of its versions as draft`,
      );
    }

    const hasAlreadyDraftVersion = workflow.versions.some(
      (version) => version.status === 'DRAFT',
    );

    // The confirmation modal is rendered outside of the command because the
    // command unmounts as soon as it has been executed
    if (hasAlreadyDraftVersion) {
      setOverrideWorkflowDraftConfirmationModalConfig({
        workflowId,
        workflowVersionIdToCopy: workflowVersionId,
      });

      openModal(OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID);

      return;
    }

    await createDraftFromWorkflowVersion({
      workflowId,
      workflowVersionIdToCopy: workflowVersionId,
    });

    navigate(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Workflow,
      objectRecordId: workflowId,
    });
  };

  // Waiting on the query settling rather than on the workflow being defined, so
  // an unreachable workflow surfaces an error and unmounts the command instead
  // of leaving the action silently stuck
  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={!loading}
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
