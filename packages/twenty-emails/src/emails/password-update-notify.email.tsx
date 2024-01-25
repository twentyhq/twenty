import { format } from 'date-fns';

import { BaseEmail } from '../components/BaseEmail';
import { CallToAction } from '../components/CallToAction';
import { MainText } from '../components/MainText';
import { Title } from '../components/Title';

type PasswordUpdateNotifyEmailProps = {
  userName: string;
  email: string;
  link: string;
};

export const PasswordUpdateNotifyEmail = ({
  userName,
  email,
  link,
}: PasswordUpdateNotifyEmailProps) => {
  const helloString = userName?.length > 1 ? `Dear ${userName}` : 'Dear';
  return (
    <BaseEmail>
      <Title value="Password updated" />
      <MainText>
        {helloString},
        <br />
        <br />
        This is a confirmation that password for your account ({email}) was
        successfully changed on {format(new Date(), 'MMMM d, yyyy')}.
        <br />
        <br />
        If you did not initiate this change, please contact your workspace owner
        immediately.
        <br />
      </MainText>
      <CallToAction value="Connect to Twenty" href={link} />
    </BaseEmail>
  );
};
