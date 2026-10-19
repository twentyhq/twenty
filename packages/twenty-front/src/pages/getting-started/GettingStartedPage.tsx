import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';
import { type GettingStartedStep } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components/feedback';
import { useGettingStarted } from '@/getting-started/hooks/useGettingStarted';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { GettingStartedSnoozeMenu } from '@/getting-started/components/GettingStartedSnoozeMenu';
import { GettingStartedPageContent } from '@/getting-started/components/GettingStartedPageContent';
import { StyledGettingStartedMuted } from '@/getting-started/components/GettingStartedStyles';
import { GettingStartedMailboxAction } from '@/getting-started/components/GettingStartedMailboxAction';
import { GettingStartedImportAction } from '@/getting-started/components/GettingStartedImportAction';
import { GettingStartedAppsAction } from '@/getting-started/components/GettingStartedAppsAction';
import { GettingStartedInviteAction } from '@/getting-started/components/GettingStartedInviteAction';
import { GettingStartedHandoverAction } from '@/getting-started/components/GettingStartedHandoverAction';
import { GettingStartedFollowUpAction } from '@/getting-started/components/GettingStartedFollowUpAction';

const PERMISSIONS = {
  connectMailbox: PermissionFlagType.CONNECTED_ACCOUNTS,
  importData: PermissionFlagType.IMPORT_CSV,
  installApp: PermissionFlagType.MARKETPLACE_APPS,
  inviteTeam: PermissionFlagType.WORKSPACE_MEMBERS,
  handoverDeals: PermissionFlagType.WORKFLOWS,
  followUpDeals: PermissionFlagType.AI,
};
const ACTIONS = {
  connectMailbox: GettingStartedMailboxAction,
  importData: GettingStartedImportAction,
  installApp: GettingStartedAppsAction,
  inviteTeam: GettingStartedInviteAction,
  handoverDeals: GettingStartedHandoverAction,
  followUpDeals: GettingStartedFollowUpAction,
};

export const GettingStartedPage = () => {
  const { t } = useLingui();
  const {
    progress,
    completedSteps,
    selectedStep,
    currentStep,
    loading,
    error,
    saving,
    selectStep,
    skip,
    refetch,
  } = useGettingStarted();
  const { showCountdown, daysLeft, trialEnd } = useGettingStartedTrial();
  const { enqueueToast } = useToast();
  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Could not save your progress. Please try again.`,
      });
    }
  };
  const select = (step: GettingStartedStep) => void run(() => selectStep(step));
  const Action = ACTIONS[selectedStep];
  const canPerformAction = useHasPermissionFlag(PERMISSIONS[selectedStep]);
  return (
    <GettingStartedPageContent
      progress={progress}
      selectedStep={selectedStep}
      loading={loading}
      error={Boolean(error)}
      saving={saving}
      showCountdown={showCountdown}
      daysLeft={daysLeft}
      trialEnd={trialEnd}
      select={select}
      onSkip={() =>
        void run(
          completedSteps.includes(selectedStep)
            ? () => selectStep(currentStep)
            : skip,
        )
      }
      onRetry={() => void refetch()}
      snoozeMenu={<GettingStartedSnoozeMenu />}
    >
      {canPerformAction ? (
        <Action />
      ) : (
        <StyledGettingStartedMuted>{t`Ask your workspace admin for permission to complete this step.`}</StyledGettingStartedMuted>
      )}
    </GettingStartedPageContent>
  );
};
