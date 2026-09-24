import { WidgetActionCallRecordingSeeAll } from '@/page-layout/widgets/call-recording/components/WidgetActionCallRecordingSeeAll';
import { useCallRecordingForWidget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForWidget';
import { getCallRecordingPlaybackMedia } from '@/page-layout/widgets/call-recording/utils/getCallRecordingPlaybackMedia';
import { buildCallRecordingTranscriptPlainText } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptPlainText';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import {
  isDefined,
  isNonEmptyArray,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';
import { IconCopy, IconLink } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const WidgetActionCallRecordingTranscript = () => {
  const { callRecording, loading, error, restriction } =
    useCallRecordingForWidget({ kind: 'transcript' });
  const { copyToClipboard } = useCopyToClipboard();

  const canExposeCallRecording =
    !loading && !isDefined(error) && !isDefined(restriction);

  const transcriptEntries = useMemo(
    () =>
      parseCallRecordingTranscriptEntries(
        canExposeCallRecording ? callRecording?.transcript : undefined,
      ),
    [callRecording?.transcript, canExposeCallRecording],
  );

  const transcriptPlainText = isNonEmptyArray(transcriptEntries)
    ? buildCallRecordingTranscriptPlainText(transcriptEntries)
    : undefined;

  const playbackMedia = getCallRecordingPlaybackMedia(
    canExposeCallRecording ? callRecording : undefined,
  );

  return (
    <>
      {isDefined(transcriptPlainText) && (
        <WidgetCardHeaderActionButton
          Icon={IconCopy}
          label={t`Copy transcript`}
          onClick={() =>
            copyToClipboard(
              transcriptPlainText,
              t`Transcript copied to clipboard`,
            )
          }
        />
      )}
      {isDefined(playbackMedia) && (
        <WidgetCardHeaderActionButton
          Icon={IconLink}
          label={
            playbackMedia.kind === 'video'
              ? t`Copy video download link`
              : t`Copy audio download link`
          }
          onClick={() =>
            copyToClipboard(playbackMedia.url, t`Link copied to clipboard`)
          }
        />
      )}
      <WidgetActionCallRecordingSeeAll />
    </>
  );
};
