import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type TwoFactorAuthenticationResetEmailProps = {
  workspaceDisplayName: string;
  locale: keyof typeof APP_LOCALES;
};

export const TwoFactorAuthenticationResetEmail = ({
  workspaceDisplayName,
  locale,
}: TwoFactorAuthenticationResetEmailProps) => {
  const i18n = createI18nInstance(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Two-factor authentication reset')} />
      <MainText>
        <Trans
          id="A recovery code was used to sign in to {workspaceDisplayName}. Your authenticator for this workspace was removed and your other sessions there were signed out."
          values={{ workspaceDisplayName }}
        />
        <br />
        <br />
        <Trans id="Set up two-factor authentication again under Settings, Profile." />
        <br />
        <br />
        <Trans id="If this was not you, contact your workspace administrator and change your password." />
        <br />
      </MainText>
      <br />
      <br />
    </BaseEmail>
  );
};

TwoFactorAuthenticationResetEmail.PreviewProps = {
  workspaceDisplayName: 'Acme',
  locale: 'en',
} as TwoFactorAuthenticationResetEmailProps;

export default TwoFactorAuthenticationResetEmail;
