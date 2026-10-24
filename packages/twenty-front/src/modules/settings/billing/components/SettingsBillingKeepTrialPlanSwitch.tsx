import { useApplyBillingSubscriptionChange } from '@/settings/billing/hooks/useApplyBillingSubscriptionChange';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCreditCard } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  type BillingPlanKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[3]};
`;

type SettingsBillingKeepTrialPlanSwitchProps = {
  trialPlanKey: BillingPlanKey;
  downgradePlanKey: BillingPlanKey;
  disabled: boolean;
};

export const SettingsBillingKeepTrialPlanSwitch = ({
  trialPlanKey,
  downgradePlanKey,
  disabled,
}: SettingsBillingKeepTrialPlanSwitchProps) => {
  const { t } = useLingui();
  const { getBeautifiedRenewDate, getBillingPlanLabel } = useBillingWording();
  const { nextPlan } = useNextPlan();
  const {
    applyBillingSubscriptionChange,
    isApplyingBillingSubscriptionChange,
  } = useApplyBillingSubscriptionChange();
  const hasPermissionToManageBilling = useHasPermissionFlag(
    PermissionFlagType.BILLING,
  );

  const trialPlanLabel = getBillingPlanLabel(trialPlanKey);
  const downgradePlanLabel = getBillingPlanLabel(downgradePlanKey);
  const trialEndDate = getBeautifiedRenewDate();

  const handleChange = (shouldKeepTrialPlan: boolean) =>
    applyBillingSubscriptionChange(
      shouldKeepTrialPlan
        ? { type: 'CANCEL_PLAN_SWITCH' }
        : { type: 'SWITCH_PLAN', targetPlanKey: downgradePlanKey },
    );

  return (
    <StyledContainer>
      <Card.Root fullWidth>
        <SettingsOptionCardContentSwitch
          Icon={IconCreditCard}
          title={t`Keep ${trialPlanLabel} after trial`}
          description={t`Trial ends ${trialEndDate}. If off, you move to the ${downgradePlanLabel} plan on that date`}
          checked={nextPlan?.planKey !== downgradePlanKey}
          disabled={
            disabled ||
            isApplyingBillingSubscriptionChange ||
            !hasPermissionToManageBilling
          }
          onChange={handleChange}
        />
      </Card.Root>
    </StyledContainer>
  );
};
