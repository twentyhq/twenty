import { billingState } from '@/client-config/states/billingState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useUsageValueFormatter = () => {
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const { formatNumber } = useNumberFormat();

  const formatUsageValue = (value: number): string => {
    if (isBillingEnabled) {
      return `${formatNumber(value)} credits`;
    }

    return `$${formatNumber(value, { decimals: 2 })}`;
  };

  const unitLabel = isBillingEnabled ? 'credits' : '$';

  return { formatUsageValue, isBillingEnabled, unitLabel };
};
