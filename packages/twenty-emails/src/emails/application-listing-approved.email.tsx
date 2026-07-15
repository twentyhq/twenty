import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type ApplicationListingApprovedEmailProps = {
  applicationName: string;
  locale: keyof typeof APP_LOCALES;
};

export const ApplicationListingApprovedEmail = ({
  applicationName,
  locale,
}: ApplicationListingApprovedEmailProps) => {
  const i18n = createI18nInstance(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Your application is now listed')} />
      <MainText>
        <Trans
          id="applicationListingApproved.summary"
          message='Good news! An administrator approved the marketplace listing request for "{applicationName}".'
          values={{ applicationName }}
        />
        <br />
        <br />
        <Trans
          id="applicationListingApproved.visibility"
          message="Your application is now visible in the marketplace and can be installed by any workspace."
        />
        <br />
      </MainText>
      <br />
      <br />
    </BaseEmail>
  );
};

ApplicationListingApprovedEmail.PreviewProps = {
  applicationName: 'My Twenty App',
  locale: 'en',
} as ApplicationListingApprovedEmailProps;

export default ApplicationListingApprovedEmail;
