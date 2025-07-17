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
import { SettingsCard } from '@/settings/components/SettingsCard';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { useTwoFactorAuthentication } from '@/settings/two-factor-authentication/hooks/useTwoFactorAuthentication';
import { isDefined } from 'twenty-shared/utils';

export const SettingsProfile = () => {
  const { t } = useLingui();

  const {
    twoFactorAuthenticationStatus,
    isTwoFactorAuthenticationEnabled,
    workspaceTwoFactorAuthenticationPolicy,
  } = useTwoFactorAuthentication();

  return (
    <SubMenuTopBarContainer
      title={t`Profile`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: <Trans>Profile</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t`Picture`} />
          <ProfilePictureUploader />
        </Section>
        <Section>
          <H2Title
            title={t`Name`}
            description={t`Your name as it will be displayed`}
          />
          <NameFields />
        </Section>
        <Section>
          <H2Title
            title={t`Email`}
            description={t`The email associated to your account`}
          />
          <EmailField />
        </Section>
        {isDefined(workspaceTwoFactorAuthenticationPolicy) &&
          isTwoFactorAuthenticationEnabled && (
            <Section>
              <UndecoratedLink
                to={getSettingsPath(SettingsPath.TwoFactorAuthentication)}
              >
                <SettingsCard
                  title={t`Authenticator App`}
                  Icon={<IconShield />}
                  Status={
                    twoFactorAuthenticationStatus ? (
                      <Status text={'Active'} color={'turquoise'} />
                    ) : (
                      <Status text={'Inactive'} color={'orange'} />
                    )
                  }
                />
              </UndecoratedLink>
            </Section>
          )}
        <Section>
          <ChangePassword />
        </Section>
        <Section>
          <DeleteAccount />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
