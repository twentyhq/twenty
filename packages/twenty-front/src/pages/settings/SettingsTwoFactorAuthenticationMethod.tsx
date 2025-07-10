import { Trans, useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ChangePassword } from '@/settings/profile/components/ChangePassword';
import { DeleteAccount } from '@/settings/profile/components/DeleteAccount';
import { EmailField } from '@/settings/profile/components/EmailField';
import { NameFields } from '@/settings/profile/components/NameFields';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { H2Title, Status, IconShield } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useRecoilValue } from 'recoil';
import { isTwoFactorAuthenticationEnabledState } from '@/client-config/states/isTwoFactorAuthenticationEnabledState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { UndecoratedLink } from 'twenty-ui/navigation';
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
          href: getSettingsPath(SettingsPath.ProfilePage)
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
