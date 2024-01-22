import * as React from 'react';

import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { BaseEmail } from 'src/components/BaseEmail';
import { HighlightedText } from 'src/components/HighlightedText';

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
