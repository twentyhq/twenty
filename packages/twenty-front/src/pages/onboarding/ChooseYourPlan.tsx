import { ModalContent } from 'twenty-ui/layout';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { ChooseYourPlanContent } from '~/pages/onboarding/internal/ChooseYourPlanContent';
import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { usePlans } from '@/settings/billing/hooks/usePlans';

const StyledChooseYourPlanPlaceholder = styled.div`
  height: 566px;
`;

export const ChooseYourPlan = () => {
  const { isPlansLoaded } = usePlans();
  const billing = useAtomStateValue(billingState);
  return (
    <ModalContent isVerticallyCentered>
      {isDefined(billing) && isPlansLoaded ? (
        <ChooseYourPlanContent billing={billing} />
      ) : (
        <StyledChooseYourPlanPlaceholder />
      )}
    </ModalContent>
  );
};
