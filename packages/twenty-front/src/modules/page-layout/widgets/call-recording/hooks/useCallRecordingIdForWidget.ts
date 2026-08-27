import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { useQuery } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { CallRecordingIdForCalendarEventDocument } from '~/generated-metadata/graphql';

export const useCallRecordingIdForWidget = ({
  skip,
}: {
  skip: boolean;
}): {
  callRecordingId: string | undefined;
  targetKind: 'calendarEvent' | 'callRecording' | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
} => {
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();
  const targetKind = callRecordingWidgetTarget?.targetKind;
  const targetRecordId = callRecordingWidgetTarget?.recordId;

  const {
    data,
    loading,
    error,
    refetch: refetchCallRecordingIdForCalendarEvent,
  } = useQuery(CallRecordingIdForCalendarEventDocument, {
    variables: { calendarEventId: targetRecordId ?? '' },
    skip: skip || !isDefined(targetRecordId) || targetKind !== 'calendarEvent',
  });

  const callRecordingId =
    targetKind === 'callRecording'
      ? targetRecordId
      : (data?.callRecordingIdForCalendarEvent ?? undefined);

  const refetch = useCallback(async () => {
    if (skip || targetKind !== 'calendarEvent') {
      return;
    }

    await refetchCallRecordingIdForCalendarEvent();
  }, [refetchCallRecordingIdForCalendarEvent, skip, targetKind]);

  return {
    callRecordingId,
    targetKind,
    loading,
    error,
    refetch,
  };
};
