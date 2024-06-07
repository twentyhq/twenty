import { Img } from '@react-email/components';

import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { HighlightedContainer } from 'src/components/HighlightedContainer';
import { HighlightedText } from 'src/components/HighlightedText';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { WhatIsTwenty } from 'src/components/WhatIsTwenty';
import { capitalize } from 'src/utils/capitalize';

type SendInviteLinkEmailProps = {
  link: string;
  workspace: { name: string | undefined; logo: string | undefined };
  sender: {
    email: string;
    firstName: string;
  };
};

export const SendInviteLinkEmail = ({
  link,
  workspace,
  sender,
}: SendInviteLinkEmailProps) => {
  return (
    <BaseEmail width={333}>
      <Title value="Join your team on Twenty" />
      <MainText>
        {capitalize(sender.firstName)} (
        <Link href={sender.email} value={sender.email} />) has invited you to
        join a workspace called <b>{workspace.name}</b>
        <br />
      </MainText>
      <HighlightedContainer>
        {workspace.logo && <Img src={workspace.logo} width={40} height={40} />}
        {workspace.name && <HighlightedText value={workspace.name} />}
        <CallToAction href={link} value="Accept invite" />
      </HighlightedContainer>
      <WhatIsTwenty />
    </BaseEmail>
  );
};
