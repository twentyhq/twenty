import { useCallRecordingsSeeAllHref } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingsSeeAllHref';
import { useCallRecordingForTranscript } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForTranscript';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/call-recording/utils/getCallRecordingVideoFileUrl';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { buildCallRecordingTranscriptPlainText } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptPlainText';
import { widgetHeaderCountComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderCountComponentFamilyState';
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
  const { callRecording, loading, error, restriction } =
    useCallRecordingForTranscript();
  const widgetHeaderCount = useAtomComponentFamilyStateValue(
    widgetHeaderCountComponentFamilyState,
    widget.id,
  );
  const callRecordingsSeeAllHref = useCallRecordingsSeeAllHref();
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

  const videoFileUrl = getCallRecordingVideoFileUrl(
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
      {isDefined(videoFileUrl) && (
        <WidgetCardHeaderActionButton
          Icon={IconLink}
          label={t`Copy video download link`}
          onClick={() =>
            copyToClipboard(videoFileUrl, t`Link copied to clipboard`)
          }
        />
      )}
      {isDefined(callRecordingsSeeAllHref) &&
        isDefined(widgetHeaderCount) &&
        widgetHeaderCount > 0 && (
          <WidgetCardHeaderActionLink
            Icon={IconArrowUpRight}
            label={t`See all call recordings linked to this calendar event`}
            to={callRecordingsSeeAllHref}
          />
        )}
    </>
  );
};
