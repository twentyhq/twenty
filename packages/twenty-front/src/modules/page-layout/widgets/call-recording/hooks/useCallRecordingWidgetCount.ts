import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { getCallRecordingWidgetFilter } from '@/page-layout/widgets/call-recording/utils/getCallRecordingWidgetFilter';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { useCallback, useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useCallRecordingWidgetCount = ({
  restriction,
}: {
  restriction: WidgetAccessDenialInfo | undefined;
}): {
  callRecordingsCount: number;
  loading: boolean;
  error: Error | undefined;
  refetchCallRecordingsCount: () => Promise<void>;
} => {
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();
  const targetKind = callRecordingWidgetTarget?.targetKind;
  const targetRecordId = callRecordingWidgetTarget?.recordId;

  const shouldSkipQuery = !isDefined(targetRecordId) || isDefined(restriction);

  const callRecordingFilter = useMemo(
    () => getCallRecordingWidgetFilter({ targetKind, targetRecordId }),
    [targetKind, targetRecordId],
  );

  const {
    records: callRecordingCountRecords,
    totalCount: callRecordingsTotalCount,
    loading,
    error,
    refetch,
  } = useFindManyRecords<WidgetCallRecordingCandidate>({
    objectNameSingular: CoreObjectNameSingular.CallRecording,
    filter: callRecordingFilter,
    recordGqlFields: { id: true },
    limit: 1,
    withSoftDeleted: targetKind === 'callRecording',
    skip: shouldSkipQuery,
  });

  const refetchCallRecordingsCount = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    callRecordingsCount:
      callRecordingsTotalCount ?? callRecordingCountRecords.length,
    loading,
    error,
    refetchCallRecordingsCount,
  };
};
