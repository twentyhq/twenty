import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { callRecordingTranscriptHeaderDataComponentFamilyState } from '@/page-layout/widgets/call-recording-transcript/states/callRecordingTranscriptHeaderDataComponentFamilyState';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect } from 'react';

type CallRecordingTranscriptHeaderDataEffectProps = {
  callRecording: CalendarEventCallRecordingCandidate | undefined;
  callRecordingsCount: number;
};

export const CallRecordingTranscriptHeaderDataEffect = ({
  callRecording,
  callRecordingsCount,
}: CallRecordingTranscriptHeaderDataEffectProps) => {
  const widget = useCurrentWidget();
  const setCallRecordingTranscriptHeaderData = useSetAtomComponentFamilyState(
    callRecordingTranscriptHeaderDataComponentFamilyState,
    widget.id,
  );

  useEffect(() => {
    setCallRecordingTranscriptHeaderData({
      callRecording,
      callRecordingsCount,
    });
  }, [
    callRecording,
    callRecordingsCount,
    setCallRecordingTranscriptHeaderData,
  ]);

  useEffect(
    () => () => {
      setCallRecordingTranscriptHeaderData(null);
    },
    [setCallRecordingTranscriptHeaderData],
  );

  return null;
};
