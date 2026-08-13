import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { useCallRecordingsSeeAllHref } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCallRecordingsSeeAllHref';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/calendar-event-call-recording/utils/getCallRecordingVideoFileUrl';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { buildCallRecordingTranscriptPlainText } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptPlainText';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { type WidgetHeaderAction } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import {
  isDefined,
  isNonEmptyArray,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';
import { IconArrowUpRight, IconCopy, IconLink } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const CallRecordingTranscriptWidgetContent = () => {
  const {
    callRecording,
    callRecordingsCount,
    loading,
    error,
    restriction,
    refetch,
  } = useCalendarEventCallRecording({
    queryScope: 'call-recording-transcript',
  });

  const { copyToClipboard } = useCopyToClipboard();
  const callRecordingsSeeAllHref = useCallRecordingsSeeAllHref();

  const transcriptEntries = useMemo(
    () =>
      isDefined(callRecording)
        ? parseCallRecordingTranscriptEntries(callRecording.transcript)
        : undefined,
    [callRecording],
  );

  const transcriptPlainText = useMemo(
    () =>
      isDefined(transcriptEntries) && isNonEmptyArray(transcriptEntries)
        ? buildCallRecordingTranscriptPlainText(transcriptEntries)
        : undefined,
    [transcriptEntries],
  );

  const videoFileUrl = isDefined(callRecording)
    ? getCallRecordingVideoFileUrl(callRecording)
    : undefined;

  const headerActions = useMemo(() => {
    const actions: WidgetHeaderAction[] = [];

    if (isDefined(transcriptPlainText)) {
      actions.push({
        id: 'copy-transcript',
        Icon: IconCopy,
        label: t`Copy transcript`,
        onClick: () =>
          copyToClipboard(
            transcriptPlainText,
            t`Transcript copied to clipboard`,
          ),
      });
    }

    if (isDefined(videoFileUrl)) {
      actions.push({
        id: 'copy-video-download-link',
        Icon: IconLink,
        label: t`Copy video download link`,
        onClick: () =>
          copyToClipboard(videoFileUrl, t`Link copied to clipboard`),
      });
    }

    if (isDefined(callRecordingsSeeAllHref) && callRecordingsCount > 0) {
      actions.push({
        id: 'see-all-call-recordings',
        Icon: IconArrowUpRight,
        label: t`See all call recordings linked to this calendar event`,
        to: callRecordingsSeeAllHref,
      });
    }

    return isNonEmptyArray(actions) ? actions : undefined;
  }, [
    transcriptPlainText,
    videoFileUrl,
    callRecordingsSeeAllHref,
    callRecordingsCount,
    copyToClipboard,
  ]);

  return (
    <>
      <WidgetHeaderInfoEffect
        count={callRecordingsCount > 0 ? callRecordingsCount : undefined}
        actions={headerActions}
      />
      <CallRecordingTranscriptBody
        callRecording={callRecording}
        transcriptEntries={transcriptEntries}
        videoFileUrl={videoFileUrl}
        loading={loading}
        error={error}
        restriction={restriction}
        refetchCallRecording={refetch}
      />
    </>
  );
};
