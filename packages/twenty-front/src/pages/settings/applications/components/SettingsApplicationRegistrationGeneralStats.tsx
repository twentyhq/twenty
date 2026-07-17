import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { UpgradeRegistrationApplicationsDocument } from '~/generated-admin/graphql';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationInstalledWorkspaces } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstalledWorkspaces';
import { SettingsApplicationRegistrationInstallStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstallStats';

const StyledUpgradeContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[6]};
`;

const UPGRADE_INSTALLATIONS_MODAL_ID =
  'upgrade-registration-applications-modal';

export const SettingsApplicationRegistrationGeneralStats = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { openModal, closeModal } = useModal();

  const [isUpgrading, setIsUpgrading] = useState(false);

  const [upgradeApplications] = useMutation(
    UpgradeRegistrationApplicationsDocument,
    { client: apolloAdminClient },
  );

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeApplications({
        variables: { applicationRegistrationId: registration.id },
      });
      enqueueSuccessSnackBar({
        message: t`Upgrade started. Existing installations will be upgraded to the latest version in the background.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to start upgrade`,
      });
    } finally {
      setIsUpgrading(false);
      closeModal(UPGRADE_INSTALLATIONS_MODAL_ID);
    }
  };

  return (
    <Section>
      <H2Title
        title={t`Install Stats`}
        description={t`Usage across all workspaces on this server`}
      />
      <SettingsApplicationRegistrationInstallStats
        registration={registration}
      />
      <SettingsApplicationRegistrationInstalledWorkspaces
        registration={registration}
      />
      <StyledUpgradeContainer>
        <Button
          Icon={IconRefresh}
          title={t`Upgrade existing installations`}
          variant="secondary"
          onClick={() => openModal(UPGRADE_INSTALLATIONS_MODAL_ID)}
          disabled={isUpgrading}
        />
      </StyledUpgradeContainer>
      <ConfirmationModal
        modalInstanceId={UPGRADE_INSTALLATIONS_MODAL_ID}
        title={t`Upgrade existing installations`}
        subtitle={t`This will upgrade "${registration.name}" to its latest available version on every workspace that already has it installed. Workspaces without the app are not affected. It runs as a background job and may take a while. Continue?`}
        onConfirmClick={handleUpgrade}
        confirmButtonText={t`Upgrade`}
        confirmButtonAccent="blue"
        loading={isUpgrading}
      />
    </Section>
  );
};
