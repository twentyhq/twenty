import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type TwoFactorAuthenticationRecoveryCodeIssuedEmailProps = {
  actorName: string;
  workspaceDisplayName: string;
  expiresAt: Date;
  locale: keyof typeof APP_LOCALES;
};

export const TwoFactorAuthenticationRecoveryCodeIssuedEmail = ({
  actorName,
  workspaceDisplayName,
  expiresAt,
  locale,
}: TwoFactorAuthenticationRecoveryCodeIssuedEmailProps) => {
  const i18n = createI18nInstance(locale);
  const formattedExpiresAt = i18n.date(expiresAt, {
    dateStyle: 'medium',
    timeStyle: 'long',
    timeZone: 'UTC',
  });

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Two-factor authentication recovery code issued')} />
      <MainText>
        <Trans
          id="{actorName} generated a recovery code that lets you sign in to {workspaceDisplayName} without your authenticator app."
          values={{ actorName, workspaceDisplayName }}
        />
        <br />
        <br />
        <Trans
          id="The code can be used once and expires on {formattedExpiresAt}. Using it removes your current authenticator for this workspace and signs you out of your other sessions there."
          values={{ formattedExpiresAt }}
        />
        <br />
        <br />
        <Trans id="If you did not ask for this, contact your workspace administrator and change your password." />
        <br />
      </MainText>
      <br />
      <br />
    </BaseEmail>
  );
};

TwoFactorAuthenticationRecoveryCodeIssuedEmail.PreviewProps = {
  actorName: 'John Doe',
  workspaceDisplayName: 'Acme',
  expiresAt: new Date('2026-07-02T10:00:00Z'),
  locale: 'en',
} as TwoFactorAuthenticationRecoveryCodeIssuedEmailProps;

export default TwoFactorAuthenticationRecoveryCodeIssuedEmail;
