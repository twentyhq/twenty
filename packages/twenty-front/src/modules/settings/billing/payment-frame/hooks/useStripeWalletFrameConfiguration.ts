import { billingState } from '@/client-config/states/billingState';
import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useStripeAppearance } from '@/settings/billing/hooks/useStripeAppearance';
import { type PaymentFrameConfiguration } from '@/settings/billing/payment-frame/types/PaymentFrameConfiguration';
import { buildPaymentFrameUrl } from '@/settings/billing/payment-frame/utils/buildPaymentFrameUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { type StripeElementsOptionsMode } from '@stripe/stripe-js';
import { useThemeColorScheme } from 'twenty-ui/theme';

export const useStripeWalletFrameConfiguration = (
  elementsOptions: StripeElementsOptionsMode,
) => {
  const stripePublishableKey =
    useAtomStateValue(billingState)?.stripePublishableKey;
  const domainConfiguration = useAtomStateValue(domainConfigurationState);
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();
  const appearance = useStripeAppearance();
  const colorScheme = useThemeColorScheme();

  const frameUrl = buildPaymentFrameUrl({
    currentUrl: window.location.href,
    frontDomain: domainConfiguration.frontDomain,
    defaultDomain,
  });

  const configuration: PaymentFrameConfiguration | undefined = isNonEmptyString(
    stripePublishableKey,
  )
    ? {
        publishableKey: stripePublishableKey,
        elementsOptions: { ...elementsOptions, appearance },
        colorScheme,
      }
    : undefined;

  return { frameUrl, configuration };
};
