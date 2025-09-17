import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

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
  const i18n = createI18nInstance(locale);
  const formattedDate = i18n.date(new Date());

  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Password updated')} />
      <MainText>
        {userName?.length > 1 ? (
          <Trans id="Dear {userName}," values={{ userName }} />
        ) : (
          <Trans id="Hello," />
        )}
        <br />
        <br />
        <Trans
          id="This is a confirmation that password for your account ({email}) was successfully changed on {formattedDate}."
          values={{ email, formattedDate }}
        />
        <br />
        <br />
        <Trans id="If you did not initiate this change, please contact your workspace owner immediately." />
        <br />
      </MainText>
      <br />
      <CallToAction value={i18n._('Connect to Twenty')} href={link} />
      <br />
      <br />
    </BaseEmail>
  );
};

PasswordUpdateNotifyEmail.PreviewProps = {
  userName: 'John Doe',
  email: 'john.doe@example.com',
  link: 'https://app.twenty.com',
  locale: 'en',
} as PasswordUpdateNotifyEmailProps;

export default PasswordUpdateNotifyEmail;
