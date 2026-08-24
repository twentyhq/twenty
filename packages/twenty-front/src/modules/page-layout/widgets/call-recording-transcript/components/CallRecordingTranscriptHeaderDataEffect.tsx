import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/calendar-event-call-recording/utils/getCallRecordingVideoFileUrl';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { callRecordingTranscriptHeaderDataComponentFamilyState } from '@/page-layout/widgets/call-recording-transcript/states/callRecordingTranscriptHeaderDataComponentFamilyState';
import { buildCallRecordingTranscriptPlainText } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptPlainText';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect } from 'react';
import {
  isDefined,
  isNonEmptyArray,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';

type CallRecordingTranscriptHeaderDataEffectProps = {
  callRecording: CalendarEventCallRecordingCandidate | undefined;
};

export const CallRecordingTranscriptHeaderDataEffect = ({
  callRecording,
}: CallRecordingTranscriptHeaderDataEffectProps) => {
  const widget = useCurrentWidget();
  const setCallRecordingTranscriptHeaderData = useSetAtomComponentFamilyState(
    callRecordingTranscriptHeaderDataComponentFamilyState,
    widget.id,
  );

  const transcriptEntries = parseCallRecordingTranscriptEntries(
    callRecording?.transcript,
  );

  const transcriptPlainText =
    isDefined(transcriptEntries) && isNonEmptyArray(transcriptEntries)
      ? buildCallRecordingTranscriptPlainText(transcriptEntries)
      : undefined;

  const videoFileUrl = isDefined(callRecording)
    ? getCallRecordingVideoFileUrl(callRecording)
    : undefined;

  useEffect(() => {
    setCallRecordingTranscriptHeaderData({
      transcriptPlainText,
      videoFileUrl,
    });
  }, [transcriptPlainText, videoFileUrl, setCallRecordingTranscriptHeaderData]);

  useEffect(
    () => () => {
      setCallRecordingTranscriptHeaderData(null);
    },
    [setCallRecordingTranscriptHeaderData],
  );

  return null;
};
