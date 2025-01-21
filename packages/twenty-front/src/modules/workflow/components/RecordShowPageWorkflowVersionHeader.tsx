import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { AppPath } from '@/types/AppPath';
import { OverrideWorkflowDraftConfirmationModal } from '@/workflow/components/OverrideWorkflowDraftConfirmationModal';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { openOverrideWorkflowDraftConfirmationModalState } from '@/workflow/states/openOverrideWorkflowDraftConfirmationModalState';
import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';
import { useSetRecoilState } from 'recoil';
import {
  Button,
  IconPencil,
  IconPlayerStop,
  IconPower,
  isDefined,
} from 'twenty-ui';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const RecordShowPageWorkflowVersionHeader = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  const workflowVersionRelatedWorkflowQuery = useFindOneRecord<
    Pick<Workflow, '__typename' | 'id' | 'lastPublishedVersionId'>
  >({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    objectRecordId: workflowVersion?.workflowId,
    recordGqlFields: {
      id: true,
      lastPublishedVersionId: true,
    },
    skip: !isDefined(workflowVersion),
  });

  // TODO: In the future, use the workflow.status property to determine if there is a draft version
  const {
    records: draftWorkflowVersions,
    loading: loadingDraftWorkflowVersions,
  } = useFindManyRecords<WorkflowVersion>({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    filter: {
      workflowId: {
        eq: workflowVersion?.workflow.id,
      },
      status: {
        eq: 'DRAFT',
      },
    },
    skip: !isDefined(workflowVersion),
    limit: 1,
  });
  const draftWorkflowVersion: WorkflowVersion | undefined =
    draftWorkflowVersions[0];

  const showUseAsDraftButton =
    !loadingDraftWorkflowVersions &&
    isDefined(workflowVersion) &&
    !workflowVersionRelatedWorkflowQuery.loading &&
    isDefined(workflowVersionRelatedWorkflowQuery.record) &&
    workflowVersion.status !== 'DRAFT' &&
    workflowVersion.id !==
      workflowVersionRelatedWorkflowQuery.record.lastPublishedVersionId;

  const hasAlreadyDraftVersion =
    !loadingDraftWorkflowVersions && isDefined(draftWorkflowVersion);

  const isWaitingForWorkflowVersion = !isDefined(workflowVersion);

  const { activateWorkflowVersion } = useActivateWorkflowVersion();
  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();

  const setOpenOverrideWorkflowDraftConfirmationModal = useSetRecoilState(
    openOverrideWorkflowDraftConfirmationModalState,
  );

  const navigate = useNavigateApp();

  return (
    <>
      {showUseAsDraftButton ? (
        <Button
          title={'Use as Draft'}
          variant="secondary"
          Icon={IconPencil}
          disabled={isWaitingForWorkflowVersion}
          onClick={async () => {
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
          }}
        />
      ) : null}

      {workflowVersion?.status === 'DRAFT' ||
      workflowVersion?.status === 'DEACTIVATED' ? (
        <Button
          title="Activate"
          variant="secondary"
          Icon={IconPower}
          disabled={isWaitingForWorkflowVersion}
          onClick={() => {
            return activateWorkflowVersion({
              workflowVersionId: workflowVersion.id,
              workflowId: workflowVersion.workflowId,
            });
          }}
        />
      ) : workflowVersion?.status === 'ACTIVE' ? (
        <Button
          title="Deactivate"
          variant="secondary"
          Icon={IconPlayerStop}
          disabled={isWaitingForWorkflowVersion}
          onClick={() => {
            return deactivateWorkflowVersion(workflowVersion.id);
          }}
        />
      ) : null}

      {isDefined(workflowVersion) && isDefined(draftWorkflowVersion) ? (
        <OverrideWorkflowDraftConfirmationModal
          workflowId={workflowVersion.workflowId}
          workflowVersionIdToCopy={workflowVersionId}
        />
      ) : null}
    </>
  );
};
