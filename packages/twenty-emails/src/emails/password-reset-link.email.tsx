import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { loadAndActivateLocale } from 'src/utils/loadAndActivateLocale';

type PasswordResetLinkEmailProps = {
  duration: string;
  link: string;
  locale: string;
};

export const PasswordResetLinkEmail = async ({
  duration,
  link,
  locale,
}: PasswordResetLinkEmailProps) => {
  await loadAndActivateLocale(locale);

  return (
    <BaseEmail locale={locale}>
      <Title value={t`Reset your password 🗝`} />
      <CallToAction href={link} value={t`Reset`} />
      <MainText>
        <Trans>
          This link is only valid for the next {duration}. If the link does not
          work, you can use the login verification link directly:
          <br />
        </Trans>
        <Link href={link} value={link} />
      </MainText>
    </BaseEmail>
  );
};
