import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type ServerAdminAccessChangedEmailProps = {
  actorName: string;
  targetName: string;
  targetEmail: string;
  canAccessFullAdminPanel: boolean;
  canImpersonate: boolean;
  locale: keyof typeof APP_LOCALES;
};

export const ServerAdminAccessChangedEmail = ({
  actorName,
  targetName,
  targetEmail,
  canAccessFullAdminPanel,
  canImpersonate,
  locale,
}: ServerAdminAccessChangedEmailProps) => {
  const i18n = createI18nInstance(locale);
  const enabledLabel = i18n._('Enabled');
  const disabledLabel = i18n._('Disabled');
  const fullAdminStatus = canAccessFullAdminPanel
    ? enabledLabel
    : disabledLabel;
  const impersonateStatus = canImpersonate ? enabledLabel : disabledLabel;

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Server administrator access changed')} />
      <MainText>
        <Trans
          id="{actorName} updated server administrator access for {targetName} ({targetEmail})."
          values={{ actorName, targetName, targetEmail }}
        />
        <br />
        <br />
        <Trans
          id="Full admin panel access: {fullAdminStatus}"
          values={{ fullAdminStatus }}
        />
        <br />
        <Trans
          id="Impersonation: {impersonateStatus}"
          values={{ impersonateStatus }}
        />
        <br />
        <br />
        <Trans id="If you did not expect this change, review your server administrators immediately." />
        <br />
      </MainText>
      <br />
      <br />
    </BaseEmail>
  );
};

ServerAdminAccessChangedEmail.PreviewProps = {
  actorName: 'John Doe',
  targetName: 'Jane Smith',
  targetEmail: 'jane.smith@example.com',
  canAccessFullAdminPanel: true,
  canImpersonate: false,
  locale: 'en',
} as ServerAdminAccessChangedEmailProps;

export default ServerAdminAccessChangedEmail;
