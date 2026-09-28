import { useLingui } from '@lingui/react/macro';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationInstalledWorkspaces } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstalledWorkspaces';
import { SettingsApplicationRegistrationInstallStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstallStats';
import { Section } from 'twenty-ui/components';

export const SettingsApplicationRegistrationGeneralStats = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();

  return (
    <Section.Root>
      <Section.Header
        title={t`Install Stats`}
        description={t`Usage across all non-deleted workspaces on this server`}
      />
      <SettingsApplicationRegistrationInstallStats
        registration={registration}
      />
      <SettingsApplicationRegistrationInstalledWorkspaces
        registration={registration}
      />
    </Section.Root>
  );
};
