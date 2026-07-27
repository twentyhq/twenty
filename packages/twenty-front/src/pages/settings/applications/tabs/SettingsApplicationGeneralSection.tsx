import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
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
  const { enqueueErrorSnackBar } = useSnackBar();

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
      enqueueErrorSnackBar({
        message: t`Failed to update auto-upgrade setting.`,
      });
    }
  };

  return (
    <Section>
      <H2Title title={t`General`} />
      <Card rounded fullWidth>
        <SettingsOptionCardContentToggle
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
