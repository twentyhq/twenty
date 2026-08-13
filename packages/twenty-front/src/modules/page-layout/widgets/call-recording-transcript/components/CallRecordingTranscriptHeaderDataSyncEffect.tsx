import { callRecordingTranscriptHeaderDataComponentFamilyState } from '@/page-layout/widgets/call-recording-transcript/states/callRecordingTranscriptHeaderDataComponentFamilyState';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect } from 'react';

type CallRecordingTranscriptHeaderDataSyncEffectProps = {
  callRecordingsCount: number;
  transcriptPlainText: string | undefined;
  videoFileUrl: string | undefined;
  pageLayoutInstanceId: string;
  widgetInstanceId: string;
};

export const CallRecordingTranscriptHeaderDataSyncEffect = ({
  callRecordingsCount,
  transcriptPlainText,
  videoFileUrl,
  pageLayoutInstanceId,
  widgetInstanceId,
}: CallRecordingTranscriptHeaderDataSyncEffectProps) => {
  const setCallRecordingTranscriptHeaderData = useSetAtomComponentFamilyState(
    callRecordingTranscriptHeaderDataComponentFamilyState,
    widgetInstanceId,
    pageLayoutInstanceId,
  );

  useEffect(() => {
    setCallRecordingTranscriptHeaderData({
      callRecordingsCount,
      transcriptPlainText,
      videoFileUrl,
    });
  }, [
    callRecordingsCount,
    transcriptPlainText,
    videoFileUrl,
    setCallRecordingTranscriptHeaderData,
  ]);

  useEffect(() => {
    return () => {
      setCallRecordingTranscriptHeaderData(null);
    };
  }, [setCallRecordingTranscriptHeaderData]);

  return null;
};
