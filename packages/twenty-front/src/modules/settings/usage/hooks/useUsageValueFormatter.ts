import { billingState } from '@/client-config/states/billingState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Returns how many decimal places are needed to represent a small value.
// For values >= 0.01 returns 2; for e.g. 0.0000001 returns 7.
const getDecimalsNeeded = (value: number): number => {
  if (value === 0) return 2;
  return Math.min(7, Math.max(0, Math.ceil(-Math.log10(value))) + 2);
};

export const useUsageValueFormatter = () => {
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const { formatNumber } = useNumberFormat();

  const formatUsageValue = (value: number): string => {
    if (isBillingEnabled) {
      const decimals = getDecimalsNeeded(value);

      return `${formatNumber(value, { decimals })} credits`;
    }

    return `$${formatNumber(value, { decimals: 2 })}`;
  };

  const unitLabel = isBillingEnabled ? 'credits' : '$';

  return { formatUsageValue, isBillingEnabled, unitLabel };
};
