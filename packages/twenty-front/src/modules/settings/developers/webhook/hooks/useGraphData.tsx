import { useAnalyticsTinybirdJwt } from '@/settings/developers/webhook/hooks/useAnalyticsTinybirdJwt';
import { fetchGraphDataOrThrow } from '@/settings/developers/webhook/utils/fetchGraphDataOrThrow';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isUndefined } from '@sniptt/guards';

export const useGraphData = (webhookId: string) => {
  const { enqueueSnackBar } = useSnackBar();
  const analyticsTinybirdJwt = useAnalyticsTinybirdJwt();
  const fetchGraphData = async (
    windowLengthGraphOption: '7D' | '1D' | '12H' | '4H',
  ) => {
    try {
      if (isUndefined(analyticsTinybirdJwt)) {
        throw new Error('No analyticsTinybirdJwt found');
      }

      return await fetchGraphDataOrThrow({
        webhookId,
        windowLength: windowLengthGraphOption,
        tinybirdJwt: analyticsTinybirdJwt,
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
