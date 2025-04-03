import { i18n } from '@lingui/core';
import { Img } from '@react-email/components';
import { emailTheme } from 'src/common-style';

import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { HighlightedContainer } from 'src/components/HighlightedContainer';
import { HighlightedText } from 'src/components/HighlightedText';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { capitalize } from 'src/utils/capitalize';
import { APP_LOCALES } from 'twenty-shared/translations';
import { getImageAbsoluteURI } from 'twenty-shared/utils';

type SendApprovedAccessDomainValidationProps = {
  link: string;
  domain: string;
  workspace: { name: string | undefined; logo: string | undefined };
  sender: {
    email: string;
    firstName: string;
    lastName: string;
  };
  serverUrl: string;
  locale: keyof typeof APP_LOCALES;
};

export const SendApprovedAccessDomainValidation = ({
  link,
  domain,
  workspace,
  sender,
  serverUrl,
  locale,
}: SendApprovedAccessDomainValidationProps) => {
  const workspaceLogo = workspace.logo
    ? getImageAbsoluteURI({ imageUrl: workspace.logo, baseUrl: serverUrl })
    : null;

  return (
    <BaseEmail width={333} locale={locale}>
      <Title value={i18n._('Validate domain')} />
      <MainText>
        {capitalize(sender.firstName)} (
        <Link
          href={`mailto:${sender.email}`}
          value={sender.email}
          color={emailTheme.font.colors.blue}
        />
        ) {i18n._('Please validate this domain to allow users with')}{' '}
        <b>@{domain}</b>{' '}
        {i18n._(
          'email addresses to join your workspace without requiring an invitation.',
        )}
        <br />
      </MainText>
      <HighlightedContainer>
        {workspaceLogo && <Img src={workspaceLogo} width={40} height={40} />}
        {workspace.name && <HighlightedText value={workspace.name} />}
        <CallToAction href={link} value={i18n._('Validate domain')} />
      </HighlightedContainer>
    </BaseEmail>
  );
};

SendApprovedAccessDomainValidation.PreviewProps = {
  link: 'https://app.twenty.com/validate-domain',
  domain: 'example.com',
  workspace: {
    name: 'Acme Inc.',
    logo: 'https://fakeimg.pl/200x200/?text=ACME&font=lobster',
  },
  sender: {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  serverUrl: 'https://app.twenty.com',
  locale: 'en',
} as SendApprovedAccessDomainValidationProps;

export default SendApprovedAccessDomainValidation;
