import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { WhatIsTwenty } from 'src/components/WhatIsTwenty';
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
    <BaseEmail width={333}>
      <Title value="Join your team on Twenty" />
      <MainText>
        {capitalize(sender.firstName)} (
        <Link href={sender.email} value={sender.email} />) has invited you to
        join a workspace called <b>{workspaceName}</b>
        <br />
      </MainText>
      <CallToAction href={link} value="Accept invite" />
      <WhatIsTwenty />
    </BaseEmail>
  );
};
