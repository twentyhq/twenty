import { t } from '@lingui/core/macro';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

type GetSwitchBillingIntervalConfirmationMessageParams = {
  getBeautifiedRenewDate: () => string;
  isTrialing: boolean;
  price: number;
  targetInterval: SettingsBillingPlanInterval;
  targetPlanKey: BillingPlanKey;
};

export const getSwitchBillingIntervalConfirmationMessage = ({
  getBeautifiedRenewDate,
  isTrialing,
  price,
  targetInterval,
  targetPlanKey,
}: GetSwitchBillingIntervalConfirmationMessageParams): string => {
  const targetPlanLabel =
    targetPlanKey === BillingPlanKey.ENTERPRISE ? t`Organization` : t`Pro`;
  const planUnchangedNotice = t`Your plan stays ${targetPlanLabel}, this only changes your billing interval.`;

  if (targetInterval === SubscriptionInterval.Year) {
    if (isTrialing) {
      return `${t`Your billing interval will switch to yearly immediately and your trial will continue. When it ends, you will be charged $${price} per user per month billed annually.`} ${planUnchangedNotice}`;
    }

    return `${t`You will be charged $${price} per user per month billed annually. A prorata with your current subscription will be applied.`} ${planUnchangedNotice}`;
  }

  if (isTrialing) {
    return `${t`Your billing interval will switch to monthly immediately and your trial will continue. When it ends, you will be charged $${price} per user per month billed monthly.`} ${planUnchangedNotice}`;
  }

  const beautifiedRenewDate = getBeautifiedRenewDate();

  return `${t`You will be charged $${price} per user per month billed monthly. The change will be applied the ${beautifiedRenewDate}.`} ${planUnchangedNotice}`;
};
