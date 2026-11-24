import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';

type SettingsBillingEmailNotMemberBannerProps = {
  billingEmail: string;
};

export const SettingsBillingEmailNotMemberBanner = ({
  billingEmail,
}: SettingsBillingEmailNotMemberBannerProps) => {
  const { t } = useLingui();

  const { openBillingPortal } = useBillingPortalSession(
    getSettingsPath(SettingsPath.Billing),
  );

  return (
    <InlineBanner
      status="info"
      action={
        <InlineBanner.Action
          onClick={openBillingPortal}
        >{t`Change email`}</InlineBanner.Action>
      }
    >
      {t`Invoices go to ${billingEmail}, who isn't a member of this workspace`}
    </InlineBanner>
  );
};
