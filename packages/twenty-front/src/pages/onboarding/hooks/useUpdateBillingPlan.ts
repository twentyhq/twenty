import { useMutation } from '@apollo/client';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { UPDATE_BILLING_PLAN } from '~/pages/onboarding/graphql/mutation/updateBillingPlanId';


type UseUpdateBillingPlanReturn = {
  updatePlan: (id: string, planId?: string) => Promise<void>;
  loading: boolean;
};

export const useUpdateBillingPlan = (): UseUpdateBillingPlanReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [mutate, { loading }] = useMutation(UPDATE_BILLING_PLAN, {
    onCompleted: () => {
      enqueueSnackBar('Plano atualizado com sucesso', {
        variant: SnackBarVariant.Success,
      });
    },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const updatePlan = async (id: string, planId?: string) => {
    if (!id) {
      enqueueSnackBar('ID do plano é obrigatório', {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    await mutate({
      variables: {
        updateBillingPlansInput: {
          id,
          planId,
        },
      },
    });
  };

  return {
    updatePlan,
    loading,
  };
};