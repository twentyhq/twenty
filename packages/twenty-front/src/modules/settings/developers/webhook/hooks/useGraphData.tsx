import { fetchGraphDataOrThrow } from '@/settings/developers/webhook/utils/fetchGraphDataOrThrow';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useGraphData = (webhookId: string) => {
  const { enqueueSnackBar } = useSnackBar();
  const fetchGraphData = async (
    windowLengthGraphOption: '7D' | '1D' | '12H' | '4H',
  ) => {
    try {
      return await fetchGraphDataOrThrow({
        webhookId,
        windowLength: windowLengthGraphOption,
      });
    } catch (error) {
      enqueueSnackBar('Something went wrong while fetching webhook usage', {
        variant: SnackBarVariant.Error,
      });
      return [];
    }
  };
  return { fetchGraphData };
};
