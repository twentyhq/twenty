import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';
import {
  UpdateApplicationDocument,
  type Application,
} from '~/generated-metadata/graphql';
import { useUpdateOneApplicationVariable } from '~/pages/settings/applications/hooks/useUpdateOneApplicationVariable';
import { SettingsApplicationConnectionsSection } from '~/pages/settings/applications/tabs/SettingsApplicationConnectionsSection';
import { SettingsApplicationDetailEnvironmentVariablesTable } from '~/pages/settings/applications/tabs/SettingsApplicationDetailEnvironmentVariablesTable';
import { SettingsApplicationFunctionDomainSection } from '~/pages/settings/applications/tabs/SettingsApplicationFunctionDomainSection';
import { applicationHasHttpTriggeredFunctions } from '~/pages/settings/applications/utils/applicationHasHttpTriggeredFunctions';
import { isUpgradableApplicationSourceType } from '~/pages/settings/applications/utils/isUpgradableApplicationSourceType';

export const SettingsApplicationDetailSettingsTab = ({
  application,
}: {
  application?: Pick<
    Application,
    | 'applicationVariables'
    | 'id'
    | 'universalIdentifier'
    | 'canBeUninstalled'
    | 'autoUpgrade'
    | 'applicationRegistration'
    | 'logicFunctions'
  >;
}) => {
  const { updateOneApplicationVariable } = useUpdateOneApplicationVariable();

  const [updateApplication] = useMutation(UpdateApplicationDocument);

  const envVariables = [...(application?.applicationVariables ?? [])].sort(
    (a, b) => a.key.localeCompare(b.key),
  );

  const hasHttpTriggeredFunctions =
    applicationHasHttpTriggeredFunctions(application);

  const isUpgradable = isUpgradableApplicationSourceType(
    application?.applicationRegistration?.sourceType,
  );

  return (
    <>
      {isUpgradable && application?.id && (
        <Section>
          <H2Title title={t`Upgrades`} />
          <Card rounded fullWidth>
            <SettingsOptionCardContentToggle
              Icon={IconRefresh}
              title={t`Auto-upgrade`}
              description={t`Automatically upgrade this application when a new version is published`}
              checked={application.autoUpgrade}
              onChange={(checked) =>
                updateApplication({
                  variables: {
                    id: application.id,
                    input: { autoUpgrade: checked },
                  },
                })
              }
            />
          </Card>
        </Section>
      )}
      {hasHttpTriggeredFunctions && application?.id && (
        <SettingsApplicationFunctionDomainSection
          applicationId={application.id}
        />
      )}
      {application?.id && (
        <SettingsApplicationConnectionsSection applicationId={application.id} />
      )}
      <SettingsApplicationDetailEnvironmentVariablesTable
        envVariables={envVariables}
        onUpdate={({ key, value }) =>
          application?.id
            ? updateOneApplicationVariable({
                key,
                value,
                applicationId: application.id,
              })
            : null
        }
      />
    </>
  );
};
