import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { animateModalState } from '@/auth/states/animateModalState';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { parseQueryParamsAndUpdateState } from '~/utils/url-query-params';

// Initialize state that are hydrated from query parameters
// We used to use recoil-sync to do this, but it was causing issues with Firefox
export const useInitializeQueryParamState = () => {
  const location = useLocation();
  const setAnimateModal = useSetRecoilState(animateModalState);
  const setBillingCheckoutSession = useSetRecoilState(
    billingCheckoutSessionState,
  );

  useEffect(() => {
    let isInitialized = false;

    if (!isInitialized) {
      const handlers = {
        animateModal: (value: string) => {
          const boolValue = value.toLowerCase() === 'true';
          setAnimateModal(boolValue);
        },

        billingCheckoutSession: (value: string) => {
          try {
            const parsedValue = JSON.parse(decodeURIComponent(value));

            if (
              typeof parsedValue === 'object' &&
              parsedValue !== null &&
              'plan' in parsedValue &&
              'interval' in parsedValue &&
              'requirePaymentMethod' in parsedValue
            ) {
              setBillingCheckoutSession(parsedValue as BillingCheckoutSession);
            }
          } catch (error) {
            console.error(
              'Failed to parse billingCheckoutSession from URL',
              error,
            );
            setBillingCheckoutSession(BILLING_CHECKOUT_SESSION_DEFAULT_VALUE);
          }
        },
      };

      parseQueryParamsAndUpdateState(location.search, handlers);
      isInitialized = true;
    }

    return () => {};
  }, [location.search, setAnimateModal, setBillingCheckoutSession]);
};
