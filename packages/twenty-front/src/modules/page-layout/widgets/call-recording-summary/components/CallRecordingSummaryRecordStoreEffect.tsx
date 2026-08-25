import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CallRecordingSummaryRecordStoreEffectProps = {
  callRecording: CalendarEventCallRecordingCandidate | undefined;
};

export const CallRecordingSummaryRecordStoreEffect = ({
  callRecording,
}: CallRecordingSummaryRecordStoreEffectProps) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    if (!isDefined(callRecording)) {
      return;
    }

    upsertRecordsInStore({ partialRecords: [callRecording] });
  }, [callRecording, upsertRecordsInStore]);

  return null;
};
