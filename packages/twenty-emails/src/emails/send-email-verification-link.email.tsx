import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { Footer } from 'src/components/Footer';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';

type SendEmailVerificationLinkEmailProps = {
  link: string;
};

export const SendEmailVerificationLinkEmail = ({
  link,
}: SendEmailVerificationLinkEmailProps) => {
  return (
    <BaseEmail width={333}>
      <Title value="Confirm your email address" />
      <CallToAction href={link} value="Verify Email" />
      <br />
      <br />
      <MainText>
        Thanks for registering for an account on Twenty! Before we get started,
        we just need to confirm that this is you. Click above to verify your
        email address.
      </MainText>
      <Footer />
    </BaseEmail>
  );
};
