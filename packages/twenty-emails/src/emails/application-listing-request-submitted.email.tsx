import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type ApplicationListingRequestSubmittedEmailProps = {
  applicationName: string;
  adminApplicationDetailUrl: string;
  locale: keyof typeof APP_LOCALES;
};

export const ApplicationListingRequestSubmittedEmail = ({
  applicationName,
  adminApplicationDetailUrl,
  locale,
}: ApplicationListingRequestSubmittedEmailProps) => {
  const i18n = createI18nInstance(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('New marketplace listing request')} />
      <MainText>
        <Trans
          id="applicationListingRequestSubmitted.summary"
          message='The owner of "{applicationName}" asked for their application to be listed in the marketplace.'
          values={{ applicationName }}
        />
        <br />
        <br />
        <Trans
          id="applicationListingRequestSubmitted.action"
          message="Review the request from the application's admin page."
        />
        <br />
      </MainText>
      <CallToAction
        href={adminApplicationDetailUrl}
        value={i18n._('Review request')}
      />
      <br />
      <br />
    </BaseEmail>
  );
};

ApplicationListingRequestSubmittedEmail.PreviewProps = {
  applicationName: 'My Twenty App',
  adminApplicationDetailUrl:
    'https://app.twenty.com/settings/admin-panel/applications/registrations/00000000-0000-0000-0000-000000000000',
  locale: 'en',
} as ApplicationListingRequestSubmittedEmailProps;

export default ApplicationListingRequestSubmittedEmail;
