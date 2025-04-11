import { animateModalURLState } from '@/auth/states/animateModalURLState';
import { billingCheckoutSessionURLState } from '@/auth/states/billingCheckoutSessionURLState';
import { useRecoilValue } from 'recoil';

export const UrlStatesInitializationEffect = () => {
  // These states have special getters that fetch values from URL params if they exist
  // Reading these values will trigger their effects which sync with URL params
  useRecoilValue(billingCheckoutSessionURLState);
  useRecoilValue(animateModalURLState);

  return <></>;
};
