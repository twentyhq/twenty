import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type TwoFactorAuthenticationBackupCodeUsedEmailProps = {
  workspaceDisplayName: string;
  remainingBackupCodeCount: number;
  locale: keyof typeof APP_LOCALES;
};

export const TwoFactorAuthenticationBackupCodeUsedEmail = ({
  workspaceDisplayName,
  remainingBackupCodeCount,
  locale,
}: TwoFactorAuthenticationBackupCodeUsedEmailProps) => {
  const i18n = createI18nInstance(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Backup code used')} />
      <MainText>
        <Trans
          id="A backup code was used to sign in to {workspaceDisplayName}. Backup codes left: {remainingBackupCodeCount}."
          values={{ workspaceDisplayName, remainingBackupCodeCount }}
        />
        <br />
        <br />
        <Trans id="You can generate new backup codes under Settings, Profile, Two-factor authentication." />
        <br />
        <br />
        <Trans id="If this was not you, change your password and generate new backup codes." />
        <br />
      </MainText>
      <br />
      <br />
    </BaseEmail>
  );
};

TwoFactorAuthenticationBackupCodeUsedEmail.PreviewProps = {
  workspaceDisplayName: 'Acme',
  remainingBackupCodeCount: 9,
  locale: 'en',
} as TwoFactorAuthenticationBackupCodeUsedEmailProps;

export default TwoFactorAuthenticationBackupCodeUsedEmail;
