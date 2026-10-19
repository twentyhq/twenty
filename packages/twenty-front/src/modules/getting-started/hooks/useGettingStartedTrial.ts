import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';

export const useGettingStartedTrial = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { userTimezone } = useUserTimezone();
  const subscription = currentWorkspace?.currentBillingSubscription;
  const trialEnd =
    subscription?.status === 'Trialing' && subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd)
      : null;
  const hasPaymentMethod =
    currentWorkspace?.billingCustomer?.hasPaymentMethod === true;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000))
    : 0;
  return {
    trialEnd,
    hasPaymentMethod,
    daysLeft,
    showCountdown: !hasPaymentMethod && trialEnd !== null,
    userTimezone,
  };
};
