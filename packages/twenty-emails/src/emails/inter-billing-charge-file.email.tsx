import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { APP_LOCALES } from 'twenty-shared/translations';

type InterBillingChargeFileEmailProps = {
  duration: string;
  link: string;
  locale: keyof typeof APP_LOCALES;
};

export const InterBillingChargeFileEmail = ({
  duration,
  link,
  locale,
}: InterBillingChargeFileEmailProps) => {
  return (
    <BaseEmail locale={locale}>
      <Title value={i18n._('Boleto Inter')} />
      <MainText>
        <Trans
          id="This is youre inter-billing charge file. It is only valid for the next {duration}."
          values={{ duration }}
        />
        <br />
      </MainText>
      <br />
      <CallToAction href={link} value={i18n._('Boleto Inter')} />
      <br />
      <br />
    </BaseEmail>
  );
};

InterBillingChargeFileEmail.PreviewProps = {
  duration: '5 buisiness days',
  link: 'https://woulz.com/files/fake-billingfile?token=fake-token',
  locale: 'en',
} as InterBillingChargeFileEmailProps;

export default InterBillingChargeFileEmail;
