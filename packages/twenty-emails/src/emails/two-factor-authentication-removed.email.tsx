import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type TwoFactorAuthenticationRemovedEmailProps = {
  workspaceDisplayName: string;
  locale: keyof typeof APP_LOCALES;
};

export const TwoFactorAuthenticationRemovedEmail = ({
  workspaceDisplayName,
  locale,
}: TwoFactorAuthenticationRemovedEmailProps) => {
  const i18n = createI18nInstance(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Two-factor authentication removed')} />
      <MainText>
        <Trans
          id="The authenticator for your account in {workspaceDisplayName} was removed from Settings. Your backup codes for this workspace no longer work."
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

TwoFactorAuthenticationRemovedEmail.PreviewProps = {
  workspaceDisplayName: 'Acme',
  locale: 'en',
} as TwoFactorAuthenticationRemovedEmailProps;

export default TwoFactorAuthenticationRemovedEmail;
