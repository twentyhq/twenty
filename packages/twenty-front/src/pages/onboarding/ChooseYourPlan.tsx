import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { ChooseYourPlanContent } from '~/pages/onboarding/internal/ChooseYourPlanContent';
import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { usePlans } from '@/billing/hooks/usePlans';

const StyledChooseYourPlanPlaceholder = styled.div`
  height: 566px;
`;

export const ChooseYourPlan = () => {
  const { isPlansLoaded } = usePlans();
  const billing = useAtomStateValue(billingState);
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
