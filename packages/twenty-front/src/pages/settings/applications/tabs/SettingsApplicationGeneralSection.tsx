import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';

import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useToast } from 'twenty-ui/feedback';
import { IconRefresh } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';
import { UpdateApplicationDocument } from '~/generated-metadata/graphql';

export const SettingsApplicationGeneralSection = ({
  applicationId,
  autoUpgrade,
}: {
  applicationId: string;
  autoUpgrade: boolean;
}) => {
  const { enqueueToast } = useToast();

  const [updateApplication] = useMutation(UpdateApplicationDocument);

  const handleAutoUpgradeChange = async (checked: boolean) => {
    try {
      await updateApplication({
        variables: {
          id: applicationId,
          input: { autoUpgrade: checked },
        },
      });
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to update auto-upgrade setting.`,
      });
    }
  };

  return (
    <Section>
      <H2Title title={t`General`} />
      <Card rounded fullWidth>
        <SettingsOptionCardContentSwitch
          Icon={IconRefresh}
          title={t`Auto-upgrade`}
          description={t`Automatically upgrade this application when a new version is published`}
          checked={autoUpgrade}
          onChange={handleAutoUpgradeChange}
        />
      </Card>
    </Section>
  );
};
