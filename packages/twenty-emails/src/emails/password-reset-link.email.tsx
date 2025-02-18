import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { APP_LOCALES } from 'twenty-shared';

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
      <Title value={t`Reset your password 🗝`} />
      <CallToAction href={link} value={t`Reset`} />
      <MainText>
        <Trans>
          This link is only valid for the next {duration}. If the link does not
          work, you can use the login verification link directly:
        </Trans>
        <br />
        <Link href={link} value={link} />
      </MainText>
    </BaseEmail>
  );
};
