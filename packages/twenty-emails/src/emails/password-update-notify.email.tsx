import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { APP_LOCALES } from 'twenty-shared';

type PasswordUpdateNotifyEmailProps = {
  userName: string;
  email: string;
  link: string;
  locale: keyof typeof APP_LOCALES;
};

export const PasswordUpdateNotifyEmail = ({
  userName,
  email,
  link,
  locale,
}: PasswordUpdateNotifyEmailProps) => {
  const helloString = userName?.length > 1 ? t`Dear ${userName}` : t`Hello`;
  const formattedDate = i18n.date(new Date());

  return (
    <BaseEmail locale={locale}>
      <Title value={t`Password updated`} />
      <MainText>
        {helloString},
        <br />
        <br />
        <Trans>
          This is a confirmation that password for your account ({email}) was
          successfully changed on {formattedDate}.
        </Trans>
        <br />
        <br />
        <Trans>
          If you did not initiate this change, please contact your workspace
          owner immediately.
        </Trans>
        <br />
      </MainText>
      <CallToAction value={t`Connect to Twenty`} href={link} />
    </BaseEmail>
  );
};
