import { useAnalyticsTinybirdJwt } from '@/analytics/hooks/useAnalyticsTinybirdJwt';
import { fetchGraphDataOrThrow } from '@/analytics/utils/fetchGraphDataOrThrow';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isUndefined } from '@sniptt/guards';

export const useGraphData = ({
  recordType,
  recordId,
  endpointName,
}: {
  recordType: string;
  recordId: string;
  endpointName: string;
}) => {
  const { enqueueSnackBar } = useSnackBar();
  const tinybirdJwt = useAnalyticsTinybirdJwt(endpointName);

  const fetchGraphData = async (
    windowLengthGraphOption: '7D' | '1D' | '12H' | '4H',
  ) => {
    try {
      if (isUndefined(tinybirdJwt)) {
        throw new Error('No jwt associated with this endpoint found');
      }

      return await fetchGraphDataOrThrow({
        recordId,
        recordType,
        windowLength: windowLengthGraphOption,
        tinybirdJwt,
        endpointName,
      });
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackBar(
          `Something went wrong while fetching webhook usage: ${error.message}`,
          {
            variant: SnackBarVariant.Error,
          },
        );
      }
      return [];
    }
  };
  return { fetchGraphData };
};
