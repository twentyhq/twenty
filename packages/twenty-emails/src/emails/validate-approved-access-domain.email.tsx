import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Img } from '@react-email/components';
import { emailTheme } from 'src/common-style';

import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { HighlightedContainer } from 'src/components/HighlightedContainer';
import { HighlightedText } from 'src/components/HighlightedText';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { WhatIsTwenty } from 'src/components/WhatIsTwenty';
import { capitalize } from 'src/utils/capitalize';
import { APP_LOCALES, getImageAbsoluteURI } from 'twenty-shared';

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
      <Title value={t`Validate domain`} />
      <MainText>
        {capitalize(sender.firstName)} (
        <Link
          href={`mailto:${sender.email}`}
          value={sender.email}
          color={emailTheme.font.colors.blue}
        />
        ) <Trans>Please validate this domain to allow users with</Trans>{' '}
        <b>@{domain}</b>{' '}
        <Trans>
          email addresses to join your workspace without requiring an
          invitation.
        </Trans>
        <br />
      </MainText>
      <HighlightedContainer>
        {workspaceLogo && <Img src={workspaceLogo} width={40} height={40} />}
        {workspace.name && <HighlightedText value={workspace.name} />}
        <CallToAction href={link} value={t`Validate domain`} />
      </HighlightedContainer>
      <WhatIsTwenty />
    </BaseEmail>
  );
};
