import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useUpdateOneTimePaidSubscriptionMutation } from '~/generated/graphql';

export const useHandleUpdateSubscription = () => {
  const [updateSubscription, { loading }] =
    useUpdateOneTimePaidSubscriptionMutation();

  const { redirect } = useRedirect();

  const { enqueueSnackBar } = useSnackBar();

  const { t } = useLingui();

  const handleUpdateSubscription = async () => {
    await updateSubscription({
      onCompleted: ({ updateOneTimePaidSubscription }) => {
        redirect(updateOneTimePaidSubscription.bankSlipFileLink, '_blank');
      },
      onError: () => {
        enqueueSnackBar(t`Error while updating subscription.`, {
          variant: SnackBarVariant.Error,
        });
      },
    });
  };

  return {
    handleUpdateSubscription,
    loading,
  };
};
