import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { BILLING_SETTINGS_URL } from 'src/constants/billing-settings-url.constant';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type BillingTrialConvertingEmailProps = {
  userName: string;
  workspaceDisplayName: string | undefined;
  trialEndsAt: Date;
  interval: 'month' | 'year';
  locale: keyof typeof APP_LOCALES;
};

// Sent 7 days before a trial WITH a credit card ends, i.e. before the first charge.
// Goal: be transparent and fair — no surprise charge. The user can cancel in one click
// before the date if Twenty is not the right fit. This is intentionally not a dark pattern.
export const BillingTrialConvertingEmail = ({
  userName,
  workspaceDisplayName,
  trialEndsAt,
  interval,
  locale,
}: BillingTrialConvertingEmailProps) => {
  const i18n = createI18nInstance(locale);
  const formattedDate = i18n.date(trialEndsAt, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <BaseEmail width={333} locale={locale}>
      <Title value={i18n._('A heads up before your trial ends')} />
      <MainText>
        {userName?.length > 1 ? (
          <Trans id="Hi {userName}," values={{ userName }} />
        ) : (
          <Trans id="Hello," />
        )}
        <br />
        <br />
        <Trans id="We don't like surprise charges, so here's a friendly heads up." />
        <br />
        <br />
        {interval === 'year' ? (
          <Trans
            id="Your free trial of <0>{workspaceDisplayName}</0> ends on {formattedDate}. Unless you cancel before then, the card on file will be charged for your annual plan."
            values={{ workspaceDisplayName, formattedDate }}
            components={{ 0: <b /> }}
          />
        ) : (
          <Trans
            id="Your free trial of <0>{workspaceDisplayName}</0> ends on {formattedDate}. Unless you cancel before then, the card on file will be charged for your monthly plan."
            values={{ workspaceDisplayName, formattedDate }}
            components={{ 0: <b /> }}
          />
        )}
        <br />
        <br />
        <Trans id="If Twenty is working for you, you're all set — there's nothing to do. If it's not the right fit, you can cancel in one click before then and you won't be charged." />
      </MainText>
      <br />
      <CallToAction
        href={BILLING_SETTINGS_URL}
        value={i18n._('Manage subscription')}
      />
      <br />
      <br />
    </BaseEmail>
  );
};

BillingTrialConvertingEmail.PreviewProps = {
  userName: 'John Doe',
  workspaceDisplayName: 'Acme Inc.',
  trialEndsAt: new Date('2026-07-02'),
  interval: 'month',
  locale: 'en',
} as BillingTrialConvertingEmailProps;

export default BillingTrialConvertingEmail;
