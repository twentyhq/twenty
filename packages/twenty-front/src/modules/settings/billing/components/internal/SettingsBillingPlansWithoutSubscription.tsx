import { billingState } from '@/client-config/states/billingState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SettingsBillingPlanComparisonTable } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTable';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/settingsBillingPlanAction.type';
import {
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { BillingPlanKey } from '~/generated-metadata/graphql';

type SettingsBillingPlansWithoutSubscriptionProps = {
  billingInterval: SettingsBillingPlanInterval;
  onBillingIntervalChange: (
    billingInterval: SettingsBillingPlanInterval,
  ) => void;
  planPrices: SettingsBillingPlanPrices;
};

export const SettingsBillingPlansWithoutSubscription = ({
  billingInterval,
  onBillingIntervalChange,
  planPrices,
}: SettingsBillingPlansWithoutSubscriptionProps) => {
  const { t } = useLingui();
  const billing = useAtomStateValue(billingState);
  const { redirect } = useRedirect();

  const billingUrl = billing?.billingUrl;
  const canOpenBillingUrl = isNonEmptyString(billingUrl);

  const choosePlanAction: SettingsBillingPlanAction = {
    accent: 'blue',
    disabled: !canOpenBillingUrl,
    onClick: canOpenBillingUrl ? () => redirect(billingUrl) : undefined,
    title: t`Choose plan`,
    variant: 'primary',
  };

  return (
    <SettingsPageContainer overflow="visible">
      <SettingsBillingPlanComparisonTable
        billingInterval={billingInterval}
        onBillingIntervalChange={onBillingIntervalChange}
        planActions={{
          [BillingPlanKey.PRO]: choosePlanAction,
          [BillingPlanKey.ENTERPRISE]: choosePlanAction,
        }}
        planPrices={planPrices}
      />
    </SettingsPageContainer>
  );
};
