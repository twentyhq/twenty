import { useAnalyticsTinybirdJwts } from '@/analytics/hooks/useAnalyticsTinybirdJwts';
import { fetchGraphDataOrThrow } from '@/analytics/utils/fetchGraphDataOrThrow';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isUndefined } from '@sniptt/guards';
import { AnalyticsTinybirdJwtMap } from '~/generated-metadata/graphql';

export const useGraphData = ({
  recordType,
  recordId,
  endpointName,
}: {
  recordType: string;
  recordId: string;
  endpointName: keyof AnalyticsTinybirdJwtMap;
}) => {
  const { enqueueSnackBar } = useSnackBar();
  const tinybirdJwt = useAnalyticsTinybirdJwts(endpointName);

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
