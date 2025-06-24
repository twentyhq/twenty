import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { SETUP_ONESIGNAL_APP } from '~/pages/onboarding/graphql/mutation/setupOneSignalApp';

export const useSetupOneSignalApp = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [setupOneSignalAppMutation, { loading }] = useMutation(
    SETUP_ONESIGNAL_APP,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
    },
  );

  const setupOneSignalApp = async () => {
    const result = await setupOneSignalAppMutation();
    return result.data?.setupOneSignalApp;
  };

  return {
    setupOneSignalApp,
    loading,
  };
};
