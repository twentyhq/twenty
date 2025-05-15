import { useMutation } from '@apollo/client';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SAVE_BILLING_PLAN_ID } from '~/pages/onboarding/graphql/mutation/saveBillingPlanId';

type UseSaveBillingPlanReturn = {
  savePlan: (planId: string) => Promise<void>;
  loading: boolean;
};

export const useSaveBillingPlan = (): UseSaveBillingPlanReturn => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { enqueueSnackBar } = useSnackBar();

  const [mutate, { loading }] = useMutation(SAVE_BILLING_PLAN_ID, {
    onCompleted: () => {
      enqueueSnackBar('Successful Plan saved', {
        variant: SnackBarVariant.Success,
      });
    },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const savePlan = async (planId: string) => {
    if (!currentWorkspace?.id) {
      enqueueSnackBar('workspace not selected', {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    await mutate({
      variables: {
        planId,
        workspaceId: currentWorkspace.id,
      },
    });
  };

  return {
    savePlan,
    loading,
  };
};
