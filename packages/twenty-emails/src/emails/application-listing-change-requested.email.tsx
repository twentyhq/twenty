import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { HighlightedContainer } from 'src/components/HighlightedContainer';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type ApplicationListingChangeRequestedEmailProps = {
  applicationName: string;
  reason: string | null;
  locale: keyof typeof APP_LOCALES;
};

export const ApplicationListingChangeRequestedEmail = ({
  applicationName,
  reason,
  locale,
}: ApplicationListingChangeRequestedEmailProps) => {
  const i18n = createI18nInstance(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Changes requested on your listing request')} />
      <MainText>
        <Trans
          id="applicationListingChangeRequested.summary"
          message='An administrator reviewed the marketplace listing request for "{applicationName}" and asked for changes before it can be listed.'
          values={{ applicationName }}
        />
        <br />
      </MainText>
      {reason !== null && reason.length > 0 ? (
        <HighlightedContainer>{reason}</HighlightedContainer>
      ) : (
        <></>
      )}
      <MainText>
        <Trans
          id="applicationListingChangeRequested.resubmit"
          message="Once you have made the requested changes, submit a new listing request from your application's settings."
        />
        <br />
      </MainText>
      <br />
      <br />
    </BaseEmail>
  );
};

ApplicationListingChangeRequestedEmail.PreviewProps = {
  applicationName: 'My Twenty App',
  reason: 'Please add screenshots and a longer description.',
  locale: 'en',
} as ApplicationListingChangeRequestedEmailProps;

export default ApplicationListingChangeRequestedEmail;
