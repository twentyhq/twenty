import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { HighlightedContainer } from 'src/components/HighlightedContainer';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type ApplicationListingRejectedEmailProps = {
  applicationName: string;
  reason: string | null;
  locale: keyof typeof APP_LOCALES;
};

export const ApplicationListingRejectedEmail = ({
  applicationName,
  reason,
  locale,
}: ApplicationListingRejectedEmailProps) => {
  const i18n = createI18nInstance(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Marketplace listing request declined')} />
      <MainText>
        <Trans
          id="applicationListingRejected.summary"
          message='An administrator declined the marketplace listing request for "{applicationName}".'
          values={{ applicationName }}
        />
        <br />
      </MainText>
      {reason !== null && reason.length > 0 ? (
        <HighlightedContainer>{reason}</HighlightedContainer>
      ) : (
        <></>
      )}
      <br />
      <br />
    </BaseEmail>
  );
};

ApplicationListingRejectedEmail.PreviewProps = {
  applicationName: 'My Twenty App',
  reason: 'The application does not meet the marketplace quality guidelines.',
  locale: 'en',
} as ApplicationListingRejectedEmailProps;

export default ApplicationListingRejectedEmail;
