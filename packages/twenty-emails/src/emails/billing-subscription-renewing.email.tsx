import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type BillingSubscriptionRenewingEmailProps = {
  userName: string;
  workspaceDisplayName: string | undefined;
  renewsAt: Date;
  billingUrl: string;
  locale: keyof typeof APP_LOCALES;
};

// Sent 7 days before a yearly subscription renews. Goal: never let a large annual
// charge be a surprise. This is both fair to the customer and expected by auto-renewal
// laws in several regions. Monthly subscriptions intentionally get no renewal reminders.
export const BillingSubscriptionRenewingEmail = ({
  userName,
  workspaceDisplayName,
  renewsAt,
  billingUrl,
  locale,
}: BillingSubscriptionRenewingEmailProps) => {
  const i18n = createI18nInstance(locale);
  const formattedDate = i18n.date(renewsAt, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <BaseEmail width={333} locale={locale}>
      <Title value={i18n._('Your plan renews in 7 days')} />
      <MainText>
        {userName?.length > 1 ? (
          <Trans id="Hi {userName}," values={{ userName }} />
        ) : (
          <Trans id="Hello," />
        )}
        <br />
        <br />
        <Trans id="Just so it's never a surprise, here's a heads up about your annual plan." />
        <br />
        <br />
        <Trans
          id="Your annual plan for <0>{workspaceDisplayName}</0> renews on {formattedDate}."
          values={{ workspaceDisplayName, formattedDate }}
          components={{ 0: <b /> }}
        />
        <br />
        <br />
        <Trans id="No action is needed if you'd like to continue. If you'd rather not renew, you can cancel anytime before then." />
      </MainText>
      <br />
      <CallToAction href={billingUrl} value={i18n._('Manage subscription')} />
      <br />
      <br />
    </BaseEmail>
  );
};

BillingSubscriptionRenewingEmail.PreviewProps = {
  userName: 'John Doe',
  workspaceDisplayName: 'Acme Inc.',
  renewsAt: new Date('2027-07-02'),
  billingUrl: 'https://app.twenty.com/settings/billing',
  locale: 'en',
} as BillingSubscriptionRenewingEmailProps;

export default BillingSubscriptionRenewingEmail;
