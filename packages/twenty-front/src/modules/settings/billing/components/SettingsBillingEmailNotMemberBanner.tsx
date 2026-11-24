import { useLingui } from '@lingui/react/macro';
import { InlineBanner } from 'twenty-ui/components/feedback';

type SettingsBillingEmailNotMemberBannerProps = {
  billingEmail: string;
  onChangeEmail: () => void;
};

export const SettingsBillingEmailNotMemberBanner = ({
  billingEmail,
  onChangeEmail,
}: SettingsBillingEmailNotMemberBannerProps) => {
  const { t } = useLingui();

  return (
    <InlineBanner
      status="info"
      action={
        <InlineBanner.Action
          onClick={onChangeEmail}
        >{t`Change email`}</InlineBanner.Action>
      }
    >
      {t`Invoices go to ${billingEmail}, who isn't a member of this workspace`}
    </InlineBanner>
  );
};
