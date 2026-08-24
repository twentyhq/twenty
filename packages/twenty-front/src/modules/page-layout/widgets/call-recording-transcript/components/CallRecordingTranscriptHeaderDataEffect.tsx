import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { callRecordingTranscriptHeaderDataComponentFamilyState } from '@/page-layout/widgets/call-recording-transcript/states/callRecordingTranscriptHeaderDataComponentFamilyState';
import { buildCallRecordingTranscriptPlainText } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptPlainText';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect } from 'react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

type CallRecordingTranscriptHeaderDataEffectProps = {
  transcriptEntries: CallRecordingParsedTranscriptEntry[] | undefined;
  videoFileUrl: string | undefined;
};

export const CallRecordingTranscriptHeaderDataEffect = ({
  transcriptEntries,
  videoFileUrl,
}: CallRecordingTranscriptHeaderDataEffectProps) => {
  const widget = useCurrentWidget();
  const setCallRecordingTranscriptHeaderData = useSetAtomComponentFamilyState(
    callRecordingTranscriptHeaderDataComponentFamilyState,
    widget.id,
  );

  const transcriptPlainText = isNonEmptyArray(transcriptEntries)
    ? buildCallRecordingTranscriptPlainText(transcriptEntries)
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
