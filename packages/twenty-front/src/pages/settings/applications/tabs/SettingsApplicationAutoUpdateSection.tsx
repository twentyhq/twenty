import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';

import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconRefresh } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { UpdateApplicationDocument } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

export const SettingsApplicationAutoUpdateSection = ({
  applicationId,
  autoUpgrade,
}: {
  applicationId: string;
  autoUpgrade: boolean;
}) => {
  const { t } = useLingui();
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
        status: 'error',
        children: t`Failed to update auto-upgrade setting.`,
      });
    }
  };

  return (
    <Section.Root>
      <Section.Header title={t`Auto update`} />
      <Card.Root fullWidth>
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
