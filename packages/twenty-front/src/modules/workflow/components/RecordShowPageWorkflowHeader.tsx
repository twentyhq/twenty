import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';

import { isDefined } from 'twenty-shared';
import {
  Button,
  IconPlayerPlay,
  IconPlayerStop,
  IconPower,
  IconSettingsAutomation,
  IconTrash,
} from 'twenty-ui';
import { assertWorkflowWithCurrentVersionIsDefined } from '../utils/assertWorkflowWithCurrentVersionIsDefined';

export const RecordShowPageWorkflowHeader = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { t } = useLingui();
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
        title={t`Test`}
        variant="secondary"
        Icon={IconPlayerPlay}
        disabled={isWaitingForWorkflowWithCurrentVersion}
        onClick={async () => {
          assertWorkflowWithCurrentVersionIsDefined(workflowWithCurrentVersion);

          if (!canWorkflowBeTested) {
            enqueueSnackBar(t`Workflow cannot be tested`, {
              variant: SnackBarVariant.Error,
              detailedMessage: t`Trigger type should be Manual - when no record(s) are selected`,
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
          });
        }}
      />

      {workflowWithCurrentVersion?.currentVersion?.status === 'DRAFT' &&
      workflowWithCurrentVersion.versions?.length > 1 ? (
        <Button
          title={t`Discard Draft`}
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
          title={t`Activate`}
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
          title={t`Deactivate`}
          variant="secondary"
          Icon={IconPlayerStop}
          disabled={isWaitingForWorkflowWithCurrentVersion}
          onClick={() => {
            assertWorkflowWithCurrentVersionIsDefined(
              workflowWithCurrentVersion,
            );

            return deactivateWorkflowVersion({
              workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
            });
          }}
        />
      ) : null}
    </>
  );
};
