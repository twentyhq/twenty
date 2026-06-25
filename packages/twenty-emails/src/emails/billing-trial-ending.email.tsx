import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type BillingTrialEndingEmailProps = {
  userName: string;
  workspaceDisplayName: string | undefined;
  trialEndsAt: Date;
  dataRetentionDays: number;
  billingUrl: string;
  locale: keyof typeof APP_LOCALES;
};

// Sent the day before a trial WITHOUT a credit card ends. Goal: get the user to
// add a payment method so they keep their workspace and data. No card on file means
// there is no surprise charge risk, only a data-loss risk, so the framing is helpful.
export const BillingTrialEndingEmail = ({
  userName,
  workspaceDisplayName,
  trialEndsAt,
  dataRetentionDays,
  billingUrl,
  locale,
}: BillingTrialEndingEmailProps) => {
  const i18n = createI18nInstance(locale);
  const formattedDate = i18n.date(trialEndsAt, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <BaseEmail width={333} locale={locale}>
      <Title value={i18n._('Your trial ends tomorrow')} />
      <MainText>
        {userName?.length > 1 ? (
          <Trans id="Hi {userName}," values={{ userName }} />
        ) : (
          <Trans id="Hello," />
        )}
        <br />
        <br />
        <Trans
          id="Your free trial of <0>{workspaceDisplayName}</0> ends on {formattedDate}."
          values={{ workspaceDisplayName, formattedDate }}
          components={{ 0: <b /> }}
        />
        <br />
        <br />
        <Trans id="To keep your workspace and everything you've built, add a payment method and pick a plan." />
        <br />
        <br />
        <Trans
          id="If you do nothing, we'll pause your workspace and keep your data safe for {dataRetentionDays} days in case you change your mind — no card will be charged."
          values={{ dataRetentionDays }}
        />
      </MainText>
      <br />
      <CallToAction href={billingUrl} value={i18n._('Add a payment method')} />
      <br />
      <br />
    </BaseEmail>
  );
};

BillingTrialEndingEmail.PreviewProps = {
  userName: 'John Doe',
  workspaceDisplayName: 'Acme Inc.',
  trialEndsAt: new Date('2026-07-02'),
  dataRetentionDays: 14,
  billingUrl: 'https://app.twenty.com/settings/billing',
  locale: 'en',
} as BillingTrialEndingEmailProps;

export default BillingTrialEndingEmail;
