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
      <Title value={<Trans id="Confirm your email address" />} />
      <CallToAction href={link} value={<Trans id="Verify Email" />} />
      <br />
      <br />
      <MainText>
        <Trans id="Thanks for registering for an account on Twenty! Before we get started, we just need to confirm that this is you. Click above to verify your email address." />
      </MainText>
    </BaseEmail>
  );
};

SendEmailVerificationLinkEmail.PreviewProps = {
  link: 'https://app.twenty.com/verify-email/123',
  locale: 'en',
};

export default SendEmailVerificationLinkEmail;
