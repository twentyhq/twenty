import { Trans, useLingui } from '@lingui/react/macro';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ChangePassword } from '@/settings/profile/components/ChangePassword';
import { DeleteAccount } from '@/settings/profile/components/DeleteAccount';
import { EmailField } from '@/settings/profile/components/EmailField';
import { NameFields } from '@/settings/profile/components/NameFields';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { useCurrentUserWorkspaceTwoFactorAuthentication } from '@/settings/two-factor-authentication/hooks/useCurrentUserWorkspaceTwoFactorAuthentication';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { H2Title, IconShield, Status } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsProfile = () => {
  const { t } = useLingui();

  const { currentUserWorkspaceTwoFactorAuthenticationMethods } =
    useCurrentUserWorkspaceTwoFactorAuthentication();

  const isTwoFactorAuthenticationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_TWO_FACTOR_AUTHENTICATION_ENABLED,
  );

  const has2FAMethod =
    currentUserWorkspaceTwoFactorAuthenticationMethods['TOTP']?.status ===
    'VERIFIED';

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
        {isTwoFactorAuthenticationEnabled && (
          <Section>
            <H2Title
              title={t`Two Factor Authentication`}
              description={t`Enhances security by requiring a code along with your password`}
            />
            <UndecoratedLink
              to={getSettingsPath(
                SettingsPath.TwoFactorAuthenticationStrategyConfig,
                { twoFactorAuthenticationStrategy: 'TOTP' },
              )}
            >
              <SettingsCard
                title={t`Authenticator App`}
                Icon={<IconShield />}
                Status={
                  has2FAMethod ? (
                    <Status text={'Active'} color={'turquoise'} />
                  ) : (
                    <Status text={'Setup'} color={'blue'} />
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
