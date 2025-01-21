import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { REMOVE_STRIPE_INTEGRATION } from '~/pages/settings/integrations/stripe/graphql/mutation/removeStripeIntegration';

interface ToggleStripeIntegration {
  deleteStripeIntegration: (id: string) => Promise<void>;
}

export const useRemoveStripeIntegration = (): ToggleStripeIntegration => {
  const { enqueueSnackBar } = useSnackBar();

  const [removeStripeIntegration] = useMutation(REMOVE_STRIPE_INTEGRATION, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
    onCompleted: () => {
      enqueueSnackBar('Successful integration excluded!', {
        variant: SnackBarVariant.Success,
      });
    },
  });

  const deleteStripeIntegration = async (id: string) => {
    await removeStripeIntegration({
      variables: {
        id,
      },
    });
  };

  return {
    deleteStripeIntegration,
  };
};
