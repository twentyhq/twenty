import { useCallRecordingsSeeAllHref } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCallRecordingsSeeAllHref';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/calendar-event-call-recording/utils/getCallRecordingVideoFileUrl';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { callRecordingTranscriptHeaderDataComponentFamilyState } from '@/page-layout/widgets/call-recording-transcript/states/callRecordingTranscriptHeaderDataComponentFamilyState';
import { buildCallRecordingTranscriptPlainText } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptPlainText';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { WidgetCardHeaderActionLink } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionLink';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import {
  isDefined,
  isNonEmptyArray,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';
import { IconArrowUpRight, IconCopy, IconLink } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const WidgetActionCallRecordingTranscript = () => {
  const widget = useCurrentWidget();
  const callRecordingTranscriptHeaderData = useAtomComponentFamilyStateValue(
    callRecordingTranscriptHeaderDataComponentFamilyState,
    widget.id,
  );
  const callRecordingsSeeAllHref = useCallRecordingsSeeAllHref();
  const { copyToClipboard } = useCopyToClipboard();

  const callRecording = callRecordingTranscriptHeaderData?.callRecording;
  const callRecordingsCount =
    callRecordingTranscriptHeaderData?.callRecordingsCount ?? 0;

  const transcriptPlainText = useMemo(() => {
    if (!isDefined(callRecording)) {
      return undefined;
    }

    const transcriptEntries = parseCallRecordingTranscriptEntries(
      callRecording.transcript,
    );

    return isDefined(transcriptEntries) && isNonEmptyArray(transcriptEntries)
      ? buildCallRecordingTranscriptPlainText(transcriptEntries)
      : undefined;
  }, [callRecording]);

  const videoFileUrl = isDefined(callRecording)
    ? getCallRecordingVideoFileUrl(callRecording)
    : undefined;

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
      {isDefined(videoFileUrl) && (
        <WidgetCardHeaderActionButton
          Icon={IconLink}
          label={t`Copy video download link`}
          onClick={() =>
            copyToClipboard(videoFileUrl, t`Link copied to clipboard`)
          }
        />
      )}
      {isDefined(callRecordingsSeeAllHref) && callRecordingsCount > 0 && (
        <WidgetCardHeaderActionLink
          Icon={IconArrowUpRight}
          label={t`See all call recordings linked to this calendar event`}
          to={callRecordingsSeeAllHref}
        />
      )}
    </>
  );
};
