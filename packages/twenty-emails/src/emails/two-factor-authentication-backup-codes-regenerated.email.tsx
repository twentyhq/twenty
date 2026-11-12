import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type TwoFactorAuthenticationBackupCodesRegeneratedEmailProps = {
  workspaceDisplayName: string;
  locale: keyof typeof APP_LOCALES;
};

export const TwoFactorAuthenticationBackupCodesRegeneratedEmail = ({
  workspaceDisplayName,
  locale,
}: TwoFactorAuthenticationBackupCodesRegeneratedEmailProps) => {
  const i18n = createI18nInstance(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('New backup codes generated')} />
      <MainText>
        <Trans
          id="New backup codes were generated for your account in {workspaceDisplayName}. Your previous backup codes no longer work."
          values={{ workspaceDisplayName }}
        />
        <br />
        <br />
        <Trans id="If this was not you, change your password and generate new backup codes under Settings, Profile, Two-factor authentication." />
        <br />
      </MainText>
      <br />
      <br />
    </BaseEmail>
  );
};

TwoFactorAuthenticationBackupCodesRegeneratedEmail.PreviewProps = {
  workspaceDisplayName: 'Acme',
  locale: 'en',
} as TwoFactorAuthenticationBackupCodesRegeneratedEmailProps;

export default TwoFactorAuthenticationBackupCodesRegeneratedEmail;
