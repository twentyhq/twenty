import { t } from '@lingui/core/macro';
import { capitalize } from 'twenty-shared/utils';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

type GetSwitchBillingPlanConfirmationMessageParams = {
  getBeautifiedRenewDate: () => string;
  isTrialing: boolean;
  price: number;
  targetInterval: SettingsBillingPlanInterval;
  targetPlanKey: BillingPlanKey;
};

export const getSwitchBillingPlanConfirmationMessage = ({
  getBeautifiedRenewDate,
  isTrialing,
  price,
  targetInterval,
  targetPlanKey,
}: GetSwitchBillingPlanConfirmationMessageParams): string => {
  const isYearly = targetInterval === SubscriptionInterval.Year;
  const intervalAdjective = isYearly ? t`yearly` : t`monthly`;
  const suffix = isYearly ? t` billed annually` : '';
  const intervalUnchangedNotice = t`Your billing interval stays ${intervalAdjective}, this only changes your plan.`;

  if (targetPlanKey === BillingPlanKey.ENTERPRISE) {
    if (isTrialing) {
      return `${t`Your plan will switch to Organization immediately and your trial will continue. When it ends, you will be charged $${price} per user per month${suffix}.`} ${intervalUnchangedNotice}`;
    }

    const body = t`you will be charged $${price} per user per month`;

    return `${capitalize(`${body}${suffix}.`)} ${intervalUnchangedNotice}`;
  }

  if (isTrialing) {
    return `${t`Your plan will switch to Pro immediately and your trial will continue. When it ends, you will be charged $${price} per user per month${suffix}.`} ${intervalUnchangedNotice}`;
  }

  const body = t`You will be charged $${price} per user per month`;
  const beautifiedRenewDate = getBeautifiedRenewDate();
  const renewDateSuffix = t`. The change will be applied the ${beautifiedRenewDate}.`;

  return `${body}${suffix}${renewDateSuffix} ${intervalUnchangedNotice}`;
};
