import styled from '@emotion/styled';

import { BillingBaseProductPricesQueryPlan } from '@/billing/types/planQueryPlan';
import { geProductPrice } from '@/billing/utils/getProductPrice';
import { OnboardingPlanCard } from '@/onboarding/components/OnboardingPlanCard';
import { CardPicker } from 'twenty-ui/input';
import { SubscriptionInterval } from '~/generated-metadata/graphql';
import { BillingPlanKey } from '~/generated/graphql';

const StyledChoosePlanCardContainer = styled.div`
  display: flex;
  width: 500px;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

type BillingPlanCardPickerProps = {
  handleChange: (provider: BillingPlanKey) => void;
  value: BillingPlanKey;
  plans: BillingBaseProductPricesQueryPlan[];
  interval?: SubscriptionInterval;
  withCreditCardTrialPeriod?: boolean;
  withCreditCardTrialPeriodDuration?: number;
  hasWithoutCreditCardTrialPeriod?: boolean;
};

export const BillingPlanCardPicker = ({
  handleChange,
  value,
  plans,
  interval = SubscriptionInterval.Month,
  withCreditCardTrialPeriod = false,
  withCreditCardTrialPeriodDuration = 0,
  hasWithoutCreditCardTrialPeriod = false,
}: BillingPlanCardPickerProps) => {
  return (
    <StyledChoosePlanCardContainer>
      {plans.map(({ baseProduct, planKey }, index) => (
        <CardPicker
          checked={value === planKey}
          handleChange={() => handleChange(planKey)}
          key={`payment-plan-${index}`}
          name="payment-plan"
        >
          <OnboardingPlanCard
            productPrice={geProductPrice(interval, baseProduct)}
            planName={baseProduct.name}
            withCreditCardTrialPeriod={withCreditCardTrialPeriod}
            withCreditCardTrialPeriodDuration={
              withCreditCardTrialPeriodDuration
            }
            hasWithoutCreditCardTrialPeriod={hasWithoutCreditCardTrialPeriod}
          />
        </CardPicker>
      ))}
    </StyledChoosePlanCardContainer>
  );
};
