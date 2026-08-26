import { useCallRecordingsSeeAllHref } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCallRecordingsSeeAllHref';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { callRecordingTranscriptHeaderDataComponentFamilyState } from '@/page-layout/widgets/call-recording-transcript/states/callRecordingTranscriptHeaderDataComponentFamilyState';
import { widgetHeaderCountComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderCountComponentFamilyState';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { WidgetCardHeaderActionLink } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionLink';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight, IconCopy, IconLink } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const WidgetActionCallRecordingTranscript = () => {
  const widget = useCurrentWidget();
  const callRecordingTranscriptHeaderData = useAtomComponentFamilyStateValue(
    callRecordingTranscriptHeaderDataComponentFamilyState,
    widget.id,
  );
  const widgetHeaderCount = useAtomComponentFamilyStateValue(
    widgetHeaderCountComponentFamilyState,
    widget.id,
  );
  const callRecordingsSeeAllHref = useCallRecordingsSeeAllHref();
  const { copyToClipboard } = useCopyToClipboard();

  const transcriptPlainText =
    callRecordingTranscriptHeaderData?.transcriptPlainText;
  const videoFileUrl = callRecordingTranscriptHeaderData?.videoFileUrl;

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
