import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/primitives/layout';
import { SectionHeader } from 'twenty-ui/components';
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
      <SectionHeader
        title={t`Install Stats`}
        description={t`Usage across all non-deleted workspaces on this server`}
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
