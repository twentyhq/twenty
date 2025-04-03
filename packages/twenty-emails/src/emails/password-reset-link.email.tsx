import { i18n } from '@lingui/core';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { APP_LOCALES } from 'twenty-shared/translations';

type PasswordResetLinkEmailProps = {
  duration: string;
  link: string;
  locale: keyof typeof APP_LOCALES;
};

export const PasswordResetLinkEmail = ({
  duration,
  link,
  locale,
}: PasswordResetLinkEmailProps) => {
  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Reset your password 🗝')} />
      <CallToAction href={link} value={i18n._('Reset')} />
      <MainText>
        {i18n._(
          `This link is only valid for the next ${duration}. If the link does not work, you can use the login verification link directly:`,
        )}
        <br />
        <Link href={link} value={link} />
      </MainText>
    </BaseEmail>
  );
};

PasswordResetLinkEmail.PreviewProps = {
  duration: '24 hours',
  link: 'https://app.twenty.com/reset-password/123',
  locale: 'en',
} as PasswordResetLinkEmailProps;

export default PasswordResetLinkEmail;
