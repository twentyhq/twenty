import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { APP_LOCALES } from 'twenty-shared/translations';

type SendEmailVerificationLinkEmailProps = {
  link: string;
  locale: keyof typeof APP_LOCALES;
};

export const SendEmailVerificationLinkEmail = ({
  link,
  locale,
}: SendEmailVerificationLinkEmailProps) => {
  return (
    <BaseEmail width={333} locale={locale}>
      <Title value={i18n._('Confirm your email address')} />
      <MainText>
        <Trans id="Thanks for registering for an account on Twenty! Before we get started, we just need to confirm that this is you. Click below to verify your email address." />
      </MainText>
      <br />
      <CallToAction href={link} value={i18n._('Verify Email')} />
      <br />
      <br />
    </BaseEmail>
  );
};

SendEmailVerificationLinkEmail.PreviewProps = {
  link: 'https://app.twenty.com/verify-email/123',
  locale: 'en',
};

export default SendEmailVerificationLinkEmail;
