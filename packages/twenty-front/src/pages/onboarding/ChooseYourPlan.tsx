import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { useBillingPlan } from '@/billing/hooks/useBillingPlan';
import { ChooseYourPlanContent } from '~/pages/onboarding/internal/ChooseYourPlanContent';
import { useRecoilValue } from 'recoil';
import { billingState } from '@/client-config/states/billingState';

const StyledChooseYourPlanPlaceholder = styled.div`
  height: 566px;
`;

export const ChooseYourPlan = () => {
  const { isPlansLoaded } = useBillingPlan();
  const billing = useRecoilValue(billingState);
  return (
    <Modal.Content isVerticalCentered>
      {isDefined(billing) && isPlansLoaded ? (
        <ChooseYourPlanContent billing={billing} />
      ) : (
        <StyledChooseYourPlanPlaceholder />
      )}
    </Modal.Content>
  );
};
