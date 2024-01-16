import * as React from 'react';
import { Link } from '@react-email/components';

import { MainText } from 'src/emails/components/MainText';
import { Title } from 'src/emails/components/Title';
import { BaseEmail } from 'src/emails/components/BaseEmail';
import { CallToAction } from 'src/emails/components/CallToAction';
import { HighlightedText } from 'src/emails/components/HighlightedText';

type PasswordUpdateNotifyEmailData = {
    userName: string;
};

export const PasswordUpdateNotifyEmail = ({
    userName,
}: PasswordUpdateNotifyEmailData) => {
    const helloString = userName?.length > 1 ? `Hello ${userName}` : 'Hello';
    return (
        <BaseEmail>
            <Title value="You changed your password" />
            <HighlightedText value="Your password changed" />
            <MainText>
                {helloString},
                <br />
                If you didn't change your password, please contact your workspace administrator right away.
                <br />
            </MainText>
        </BaseEmail>
    );
}

export default PasswordUpdateNotifyEmail;
