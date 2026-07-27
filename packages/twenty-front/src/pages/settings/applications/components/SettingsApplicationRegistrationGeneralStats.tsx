import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationInstalledWorkspaces } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstalledWorkspaces';
import { SettingsApplicationRegistrationInstallStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstallStats';

export const SettingsApplicationRegistrationGeneralStats = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();

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
    </Section>
  );
};
