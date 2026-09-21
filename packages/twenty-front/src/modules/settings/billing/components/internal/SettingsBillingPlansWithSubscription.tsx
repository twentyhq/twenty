import { SettingsBillingPlanComparisonTable } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTable';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useApplyBillingSubscriptionChange } from '@/settings/billing/hooks/useApplyBillingSubscriptionChange';
import { useBillingPlanActions } from '@/settings/billing/hooks/useBillingPlanActions';
import { useBillingSubscriptionChangeWording } from '@/settings/billing/hooks/useBillingSubscriptionChangeWording';
import { type BillingSubscriptionChange } from '@/settings/billing/types/billingSubscriptionChange.type';
import {
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type BillingPlanKey } from '~/generated-metadata/graphql';

type SettingsBillingPlansWithSubscriptionProps = {
  billingInterval: SettingsBillingPlanInterval;
  currentPlanKey: BillingPlanKey;
  onBillingIntervalChange: (
    billingInterval: SettingsBillingPlanInterval,
  ) => void;
  planPrices: SettingsBillingPlanPrices;
};

export const SettingsBillingPlansWithSubscription = ({
  billingInterval,
  currentPlanKey,
  onBillingIntervalChange,
  planPrices,
}: SettingsBillingPlansWithSubscriptionProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const [pendingChange, setPendingChange] =
    useState<BillingSubscriptionChange | null>(null);
  const {
    applyBillingSubscriptionChange,
    isApplyingBillingSubscriptionChange,
  } = useApplyBillingSubscriptionChange();
  const { getBillingSubscriptionChangeWording } =
    useBillingSubscriptionChangeWording();
  const { planActions } = useBillingPlanActions({
    billingInterval,
    currentPlanKey,
    isApplyingBillingSubscriptionChange,
    onBillingSubscriptionChangeRequested: (change) => {
      setPendingChange(change);
      openDialog(BILLING_MODAL_IDS.confirmSubscriptionChange);
    },
  });

  const pendingChangeWording = isDefined(pendingChange)
    ? getBillingSubscriptionChangeWording({
        change: pendingChange,
        selectedInterval: billingInterval,
      })
    : undefined;

  return (
    <SettingsPageContainer overflow="visible">
      <SettingsBillingPlanComparisonTable
        billingInterval={billingInterval}
        onBillingIntervalChange={onBillingIntervalChange}
        planActions={planActions}
        planPrices={planPrices}
      />
      {isDefined(pendingChange) && isDefined(pendingChangeWording) && (
        <ConfirmationDialog
          dialogId={BILLING_MODAL_IDS.confirmSubscriptionChange}
          title={pendingChangeWording.title}
          subtitle={pendingChangeWording.subtitle}
          onConfirmClick={() => applyBillingSubscriptionChange(pendingChange)}
          confirmButtonText={t`Confirm`}
          confirmButtonColor="accent"
          loading={isApplyingBillingSubscriptionChange}
        />
      )}
    </SettingsPageContainer>
  );
};
