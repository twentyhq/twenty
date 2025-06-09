import { SWITCH_PLAN_MODAL_ID } from '@/settings/billing/constants/ChangeSubscriptionModalId';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { useSwitchPlanMutation } from '~/generated/graphql';

export const useHandleSwichPlan = () => {
  const { enqueueSnackBar } = useSnackBar();

  const { closeModal } = useModal();

  const [switchPlan, { loading }] = useSwitchPlanMutation({
    onCompleted: () => {
      enqueueSnackBar('Plan changed sucessfuly');
      closeModal(SWITCH_PLAN_MODAL_ID);
    },
    onError: (error) => {
      enqueueSnackBar('Error changing plan');
      // eslint-disable-next-line no-console
      console.error('Error changing plan', error);
    },
    refetchQueries: [GET_CURRENT_USER],
  });

  return {
    switchPlan,
    loading,
  };
};
