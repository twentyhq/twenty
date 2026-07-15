import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type ApplicationClaimedEmailProps = {
  applicationName: string;
  workspaceDisplayName: string;
  locale: keyof typeof APP_LOCALES;
};

export const ApplicationClaimedEmail = ({
  applicationName,
  workspaceDisplayName,
  locale,
}: ApplicationClaimedEmailProps) => {
  const i18n = createI18nInstance(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Application claimed')} />
      <MainText>
        <Trans
          id="applicationClaimed.summary"
          message='The application "{applicationName}" has been claimed by the workspace {workspaceDisplayName}.'
          values={{ applicationName, workspaceDisplayName }}
        />
        <br />
        <br />
        <Trans
          id="applicationClaimed.ownership"
          message="That workspace now owns the application's marketplace registration and can manage its listing."
        />
        <br />
      </MainText>
      <br />
      <br />
    </BaseEmail>
  );
};

ApplicationClaimedEmail.PreviewProps = {
  applicationName: 'My Twenty App',
  workspaceDisplayName: 'Acme Inc',
  locale: 'en',
} as ApplicationClaimedEmailProps;

export default ApplicationClaimedEmail;
