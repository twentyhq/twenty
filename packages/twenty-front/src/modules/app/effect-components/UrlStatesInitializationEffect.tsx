import { animateModalURLParamState } from '@/auth/states/animateModalURLParamState';
import { billingCheckoutSessionURLParamState } from '@/auth/states/billingCheckoutSessionURLParamState';
import { useRecoilValue } from 'recoil';

export const UrlStatesInitializationEffect = () => {
  // These states have special getters that fetch values from URL params if they exist
  // Reading these values will trigger their effects which sync with URL params
  useRecoilValue(billingCheckoutSessionURLParamState);
  useRecoilValue(animateModalURLParamState);

  return <></>;
};
