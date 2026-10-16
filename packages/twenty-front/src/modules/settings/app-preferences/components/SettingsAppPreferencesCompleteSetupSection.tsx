import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPlayerPlay } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type SettingsAppPreferencesCompleteSetupSectionProps = {
  connectedAccountId: string;
  description: string;
};

export const SettingsAppPreferencesCompleteSetupSection = ({
  connectedAccountId,
  description,
}: SettingsAppPreferencesCompleteSetupSectionProps) => {
  const { t } = useLingui();

  return (
    <Section.Root>
      <Section.Header title={t`Setup incomplete`} description={description} />
      <Button
        startIcon={<IconPlayerPlay />}
        variant="outline"
        size="sm"
        nativeButton={false}
        role="link"
        render={
          <Link
            to={getSettingsPath(SettingsPath.AccountsConfiguration, {
              connectedAccountId,
            })}
          />
        }
      >
        {t`Complete setup`}
      </Button>
    </Section.Root>
  );
};
