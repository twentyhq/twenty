import { IconCreditCard } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { useBillingPortalSessionQuery } from '~/generated/graphql.tsx';
export const ManageYourSubscription = () => {
  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: '/settings/billing',
    },
  });
  const handleButtonClick = () => {
    if (data) {
      window.location.replace(data.billingPortalSession.url);
    }
  };
  return (
    <Button
      Icon={IconCreditCard}
      title="View billing details"
      variant="secondary"
      onClick={handleButtonClick}
      disabled={loading}
    />
  );
};
