import { Trans } from '@lingui/react/macro';

import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { Footer } from 'src/components/Footer';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { APP_LOCALES } from 'twenty-shared';

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
      <Title value={<Trans>Confirm your email address</Trans>} />
      <CallToAction href={link} value={<Trans>Verify Email</Trans>} />
      <br />
      <br />
      <MainText>
        <Trans>
          Thanks for registering for an account on Twenty! Before we get
          started, we just need to confirm that this is you. Click above to
          verify your email address.
        </Trans>
      </MainText>
      <Footer />
    </BaseEmail>
  );
};
