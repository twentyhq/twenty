import * as React from 'react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';

type PasswordResetLinkEmailProps = {
  duration: string;
  link: string;
};

export const PasswordResetLinkEmail = ({
  duration,
  link,
}: PasswordResetLinkEmailProps) => {
  return (
    <BaseEmail>
      <Title value="Reset your password 🗝" />
      <CallToAction href={link} value="Reset" />
      <MainText>
        This link is only valid for the next {duration}. If link does not work,
        you can use the login verification link directly:
        <br />
        <Link href={link} value={link} />
      </MainText>
    </BaseEmail>
  );
};
