import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useCallback, useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useCallRecordingWidgetCount = ({
  restriction,
  refetchCallRecording,
}: {
  restriction: WidgetAccessDenialInfo | undefined;
  refetchCallRecording: () => Promise<unknown>;
}): {
  callRecordingsCount: number;
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
} => {
  const widget = useCurrentWidget();
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();
  const targetKind = callRecordingWidgetTarget?.targetKind;
  const targetRecordId = callRecordingWidgetTarget?.recordId;

  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const shouldSkipQuery = !isDefined(targetRecordId) || isDefined(restriction);

  const callRecordingFilter = useMemo(() => {
    if (!isDefined(targetRecordId)) {
      return undefined;
    }

    return targetKind === 'calendarEvent'
      ? { calendarEventId: { eq: targetRecordId } }
      : { id: { eq: targetRecordId } };
  }, [targetKind, targetRecordId]);

  const {
    records: callRecordingCountRecords,
    totalCount: callRecordingsTotalCount,
    loading,
    error,
    refetch: refetchCallRecordingsCount,
  } = useFindManyRecords<WidgetCallRecordingCandidate>({
    objectNameSingular: CoreObjectNameSingular.CallRecording,
    filter: callRecordingFilter,
    recordGqlFields: { id: true },
    limit: 1,
    withSoftDeleted: targetKind === 'callRecording',
    skip: shouldSkipQuery,
  });

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
      variables: { filter: callRecordingFilter },
    }),
    [callRecordingFilter],
  );

  const refetch = useCallback(async () => {
    await Promise.all([refetchCallRecording(), refetchCallRecordingsCount()]);
  }, [refetchCallRecording, refetchCallRecordingsCount]);

  useListenToEventsForQuery({
    queryId: `call-recording-widget-${widget.id}-${targetRecordId}`,
    operationSignature,
    skip: shouldSkipQuery,
    onSseReconnected: refetch,
  });

  const handleCallRecordingOperation = useCallback(() => {
    if (!shouldSkipQuery) {
      refetch();
    }
  }, [refetch, shouldSkipQuery]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleCallRecordingOperation,
    objectMetadataItemId: callRecordingObjectMetadataItem.id,
  });

  return {
    callRecordingsCount:
      callRecordingsTotalCount ?? callRecordingCountRecords.length,
    loading,
    error,
    refetch,
  };
};
