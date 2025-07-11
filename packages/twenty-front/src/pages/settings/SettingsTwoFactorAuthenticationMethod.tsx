import { Trans, useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { Section } from 'twenty-ui/layout';
import { DeleteTwoFactorAuthentication } from '@/settings/two-factor-authentication/components/DeleteTwoFactorAuthenticationMethod';

export const SettingsTwoFactorAuthenticationMethod = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Two Factor Authentication`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: <Trans>Profile</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: <Trans>Two-Factor Authentication</Trans>,
          href: getSettingsPath(SettingsPath.TwoFactorAuthentication),
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <DeleteTwoFactorAuthentication />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
