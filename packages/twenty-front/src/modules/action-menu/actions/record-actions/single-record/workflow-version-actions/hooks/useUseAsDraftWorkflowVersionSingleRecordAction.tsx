import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import { OverrideWorkflowDraftConfirmationModal } from '@/workflow/components/OverrideWorkflowDraftConfirmationModal';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { openOverrideWorkflowDraftConfirmationModalState } from '@/workflow/states/openOverrideWorkflowDraftConfirmationModalState';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useUseAsDraftWorkflowVersionSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const workflowVersion = useWorkflowVersion(recordId);

    const workflow = useWorkflowWithCurrentVersion(
      workflowVersion?.workflow?.id ?? '',
    );

    const { createDraftFromWorkflowVersion } =
      useCreateDraftFromWorkflowVersion();

    const setOpenOverrideWorkflowDraftConfirmationModal = useSetRecoilState(
      openOverrideWorkflowDraftConfirmationModalState,
    );

    const navigate = useNavigateApp();

    const hasAlreadyDraftVersion =
      workflow?.versions.some((version) => version.status === 'DRAFT') || false;

    const onClick = async () => {
      if (!workflowVersion || !workflow) {
        return;
      }

      if (hasAlreadyDraftVersion) {
        setOpenOverrideWorkflowDraftConfirmationModal(true);
      } else {
        await createDraftFromWorkflowVersion({
          workflowId: workflowVersion.workflow.id,
          workflowVersionIdToCopy: workflowVersion.id,
        });
        navigate(AppPath.RecordShowPage, {
          objectNameSingular: CoreObjectNameSingular.Workflow,
          objectRecordId: workflowVersion.workflow.id,
        });
      }
    };

    const ConfirmationModal = isDefined(workflowVersion) ? (
      <OverrideWorkflowDraftConfirmationModal
        workflowId={workflowVersion.workflow.id}
        workflowVersionIdToCopy={workflowVersion.id}
      />
    ) : undefined;

    return {
      onClick,
      ConfirmationModal,
    };
  };
