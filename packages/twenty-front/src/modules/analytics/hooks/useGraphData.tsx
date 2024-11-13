import { useAnalyticsTinybirdJwts } from '@/analytics/hooks/useAnalyticsTinybirdJwts';
import { AnalyticsComponentProps as useGraphDataProps } from '@/analytics/types/AnalyticsComponentProps';
import { fetchGraphDataOrThrow } from '@/analytics/utils/fetchGraphDataOrThrow';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isUndefined } from '@sniptt/guards';
import { useCallback } from 'react';

export const useGraphData = ({ recordId, endpointName }: useGraphDataProps) => {
  const { enqueueSnackBar } = useSnackBar();
  const tinybirdJwt = useAnalyticsTinybirdJwts(endpointName);

  const fetchGraphData = useCallback(
    async (windowLengthGraphOption: '7D' | '1D' | '12H' | '4H') => {
      try {
        if (isUndefined(tinybirdJwt)) {
          throw new Error('No jwt associated with this endpoint found');
        }

        return await fetchGraphDataOrThrow({
          recordId,
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
    },
    [tinybirdJwt, recordId, endpointName, enqueueSnackBar],
  );

  return { fetchGraphData };
};
