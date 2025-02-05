import { useMutation } from '@apollo/client';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { UPDATE_SERVICE_LEVEL } from '@/settings/service-center/service-level/graphql/mutation/updateWhatsappServiceLevel';

interface UseUpdateServiceLevelReturn {
  updateSla: (integrationId: string, sla: number) => Promise<void>;
}

export const useUpdateWhatsappServiceLevel =
  (): UseUpdateServiceLevelReturn => {
    const { enqueueSnackBar } = useSnackBar();

    const [updateServiceLevel] = useMutation(UPDATE_SERVICE_LEVEL, {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Service Level updated successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    });

    const updateSla = async (integrationId: string, sla: number) => {
      await updateServiceLevel({
        variables: {
          integrationId,
          sla,
        },
      });
    };

    return {
      updateSla,
    };
  };
