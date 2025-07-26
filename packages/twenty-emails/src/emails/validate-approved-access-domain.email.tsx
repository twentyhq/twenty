import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react';
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
import { DEFAULT_WORKSPACE_LOGO } from 'src/constants/DefaultWorkspaceLogo';

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

  const senderName = capitalize(sender.firstName);
  const senderEmail = sender.email;

  return (
    <BaseEmail width={333} locale={locale}>
      <Title value={i18n._('Validate domain')} />
      <MainText>
        <Trans
          id="{senderName} (<0>{senderEmail}</0>): Please validate this domain to allow users with <1>@{domain}</1> email addresses to join your workspace without requiring an invitation."
          values={{ senderName, senderEmail, domain }}
          components={{
            0: (
              <Link
                href={`mailto:${senderEmail}`}
                value={senderEmail}
                color={emailTheme.font.colors.blue}
              />
            ),
            1: <b />,
          }}
        />
        <br />
      </MainText>
      <HighlightedContainer>
        <object
          data={workspaceLogo ?? DEFAULT_WORKSPACE_LOGO}
          width={40}
          height={40}
          aria-label="Workspace logo"
        >
          <Img
            src={DEFAULT_WORKSPACE_LOGO}
            width={40}
            height={40}
            alt="Workspace logo"
          />
        </object>
        {workspace.name ? <HighlightedText value={workspace.name} /> : <></>}
        <CallToAction href={link} value={i18n._('Validate domain')} />
      </HighlightedContainer>
      <br />
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
