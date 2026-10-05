import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';

import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { Section, useToast } from 'twenty-ui/components';
import { IconRefresh } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { UpdateApplicationDocument } from '~/generated-metadata/graphql';

export const SettingsApplicationAutoUpdateSection = ({
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
    <Section.Root>
      <Section.Header title={t`Auto update`} />
      <Card.Root rounded fullWidth>
        <SettingsOptionCardContentSwitch
          Icon={IconRefresh}
          title={t`Auto-upgrade`}
          description={t`Automatically upgrade this application when a new version is published`}
          checked={autoUpgrade}
          onChange={handleAutoUpgradeChange}
        />
      </Card.Root>
    </Section.Root>
  );
};
