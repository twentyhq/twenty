import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';
import { GET_ALL_BILLING_PLAN } from '~/pages/onboarding/graphql/query/getAllBillingPlan';
import { GetBillingPlan } from '~/pages/onboarding/types/BillingPlans';

type GetAllBillingPlan = {
  billinPlan: GetBillingPlan[];
  refetchBillingPlan: () => void;
  loading: boolean;
};

export const useGetAllBillingPlan = (): GetAllBillingPlan => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data,
    refetch: refetchBillingPlan,
    loading,
  } = useQuery(GET_ALL_BILLING_PLAN, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    billinPlan: data?.getAllBillingPlans,
    refetchBillingPlan,
    loading,
  };
};
