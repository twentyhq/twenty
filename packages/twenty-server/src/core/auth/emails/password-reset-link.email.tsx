import * as React from 'react';
import { Link } from '@react-email/components';

import { MainText } from 'src/emails/components/MainText';
import { Title } from 'src/emails/components/Title';
import { BaseEmail } from 'src/emails/components/BaseEmail';
import { CallToAction } from 'src/emails/components/CallToAction';

type PasswordResetLinkEmailData = {
    userName: string;
    duration: string;
    link: string;
};

export const PasswordResetLinkEmail = ({
    userName,
    duration,
    link,
}: PasswordResetLinkEmailData) => {
    const helloString = userName?.length > 1 ? `Hello ${userName}` : 'Hello';
    return (
        <BaseEmail>
            <Title value="Reset your password" />
            <CallToAction href={link} value="Reset" />
            <MainText>
                {helloString},
                <br />
                This link is only valid for the next {duration}.
                If link does not work, you can use reset link directly:
                <br />
                <Link href={link}>{link}</Link>
            </MainText>
        </BaseEmail>
    );
}

export default PasswordResetLinkEmail;
