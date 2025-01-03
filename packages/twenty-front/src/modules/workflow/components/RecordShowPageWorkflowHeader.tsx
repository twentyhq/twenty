import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useTheme } from '@emotion/react';
import {
  Button,
  IconPlayerPlay,
  IconPlayerStop,
  IconPower,
  IconSettingsAutomation,
  IconTrash,
  isDefined,
} from 'twenty-ui';
import { assertWorkflowWithCurrentVersionIsDefined } from '../utils/assertWorkflowWithCurrentVersionIsDefined';

export const RecordShowPageWorkflowHeader = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const isWaitingForWorkflowWithCurrentVersion =
    !isDefined(workflowWithCurrentVersion) ||
    !isDefined(workflowWithCurrentVersion.currentVersion);

  const { activateWorkflowVersion } = useActivateWorkflowVersion();
  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();
  const { deleteOneWorkflowVersion } = useDeleteOneWorkflowVersion();
  const { runWorkflowVersion } = useRunWorkflowVersion();

  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();

  const trigger = workflowWithCurrentVersion?.currentVersion.trigger;

  const canWorkflowBeTested =
    trigger?.type === 'MANUAL' && !trigger.settings.objectType;

  return (
    <>
      <Button
        title="Test"
        variant="secondary"
        Icon={IconPlayerPlay}
        disabled={isWaitingForWorkflowWithCurrentVersion}
        onClick={async () => {
          assertWorkflowWithCurrentVersionIsDefined(workflowWithCurrentVersion);

          if (!canWorkflowBeTested) {
            enqueueSnackBar('Workflow cannot be tested', {
              variant: SnackBarVariant.Error,
              detailedMessage:
                'Trigger type should be Manual - when no record(s) are selected',
              icon: (
                <IconSettingsAutomation
                  size={16}
                  color={theme.snackBar.error.color}
                />
              ),
            });
            return;
          }

          await runWorkflowVersion({
            workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
            workflowName: workflowWithCurrentVersion.name,
          });
        }}
      />

      {workflowWithCurrentVersion?.currentVersion?.status === 'DRAFT' &&
      workflowWithCurrentVersion.versions?.length > 1 ? (
        <Button
          title="Discard Draft"
          variant="secondary"
          Icon={IconTrash}
          disabled={isWaitingForWorkflowWithCurrentVersion}
          onClick={() => {
            assertWorkflowWithCurrentVersionIsDefined(
              workflowWithCurrentVersion,
            );

            return deleteOneWorkflowVersion({
              workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
            });
          }}
        />
      ) : null}

      {workflowWithCurrentVersion?.currentVersion?.status === 'DRAFT' ||
      workflowWithCurrentVersion?.currentVersion?.status === 'DEACTIVATED' ? (
        <Button
          title="Activate"
          variant="secondary"
          Icon={IconPower}
          disabled={isWaitingForWorkflowWithCurrentVersion}
          onClick={() => {
            assertWorkflowWithCurrentVersionIsDefined(
              workflowWithCurrentVersion,
            );

            return activateWorkflowVersion({
              workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
              workflowId: workflowWithCurrentVersion.id,
            });
          }}
        />
      ) : workflowWithCurrentVersion?.currentVersion?.status === 'ACTIVE' ? (
        <Button
          title="Deactivate"
          variant="secondary"
          Icon={IconPlayerStop}
          disabled={isWaitingForWorkflowWithCurrentVersion}
          onClick={() => {
            assertWorkflowWithCurrentVersionIsDefined(
              workflowWithCurrentVersion,
            );

            return deactivateWorkflowVersion(
              workflowWithCurrentVersion.currentVersion.id,
            );
          }}
        />
      ) : null}
    </>
  );
};
