import { TOGGLE_FOCUSNFE_INTEGRATION_STATUS } from '@/settings/integrations/focus-nfe/graphql/mutation/toggleInterIntegrationStatus';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface ToggleFocusNfeIntegration {
  toggleFocusNfeIntegrationStatus: (
    focusNfeIntegrationId: string,
  ) => Promise<void>;
}

export const useToggleFocusNfeIntegrationStatus =
  (): ToggleFocusNfeIntegration => {
    const { enqueueSnackBar } = useSnackBar();

    const [toggleFocusNfeIntegrationMutation] = useMutation(
      TOGGLE_FOCUSNFE_INTEGRATION_STATUS,
      {
        onError: (error) => {
          enqueueSnackBar(error.message, {
            variant: SnackBarVariant.Error,
          });
        },
      },
    );

    const toggleFocusNfeIntegrationStatus = async (
      focusNfeIntegrationId: string,
    ) => {
      await toggleFocusNfeIntegrationMutation({
        variables: {
          focusNfeIntegrationId,
        },
      });
    };

    return {
      toggleFocusNfeIntegrationStatus,
    };
  };
