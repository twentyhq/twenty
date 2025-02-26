import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';
import { GET_ALL_STRIPE_INTEGRATIONS } from '~/pages/settings/integrations/stripe/graphql/query/getAllStripeIntegratons';
import { FindStripeIntegration } from '../types/StripeIntegration';

type FindAllStripeIntegrations = {
  stripeIntegrations: FindStripeIntegration[];
  refetchStripe: () => void;
  loading: boolean;
};

export const useFindAllStripeIntegrations = (): FindAllStripeIntegrations => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data,
    refetch: refetchStripe,
    loading,
  } = useQuery(GET_ALL_STRIPE_INTEGRATIONS, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    stripeIntegrations: data?.getAllStripeIntegrations,
    refetchStripe,
    loading,
  };
};
