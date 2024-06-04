import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { SubTitle } from 'src/components/SubTitle';
import { Title } from 'src/components/Title';
import { capitalize } from 'src/utils/capitalize';

type SendInviteLinkEmailProps = {
  link: string;
  workspaceName: string | undefined;
  sender: {
    email: string;
    firstName: string;
  };
};

export const SendInviteLinkEmail = ({
  link,
  workspaceName,
  sender,
}: SendInviteLinkEmailProps) => {
  return (
    <BaseEmail>
      <Title value="Join your team on Twenty" />
      <MainText>
        {capitalize(sender.firstName)} (
        <Link href={sender.email} value={sender.email} />) has invited you to
        join a workspace called <b>{workspaceName}</b>
        <br />
        <CallToAction href={link} value="Accept invite" />
      </MainText>
      <SubTitle value="What is Twenty?" />
      <MainText>
        A software to help businesses manage their customer data and
        relationships efficiently.
      </MainText>
    </BaseEmail>
  );
};
