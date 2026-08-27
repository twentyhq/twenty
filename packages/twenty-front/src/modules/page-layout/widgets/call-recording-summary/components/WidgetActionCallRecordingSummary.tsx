import { useCallRecordingsSeeAllHref } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingsSeeAllHref';
import { useCallRecordingForSummary } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForSummary';
import { getCallRecordingSummaryMarkdown } from '@/page-layout/widgets/call-recording-summary/utils/getCallRecordingSummaryMarkdown';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { widgetHeaderCountComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderCountComponentFamilyState';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { WidgetCardHeaderActionLink } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionLink';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight, IconCopy } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const WidgetActionCallRecordingSummary = () => {
  const widget = useCurrentWidget();
  const { callRecording, loading, error, restriction } =
    useCallRecordingForSummary();
  const widgetHeaderCount = useAtomComponentFamilyStateValue(
    widgetHeaderCountComponentFamilyState,
    widget.id,
  );
  const callRecordingsSeeAllHref = useCallRecordingsSeeAllHref();
  const { copyToClipboard } = useCopyToClipboard();

  const summaryMarkdown =
    !loading && !isDefined(error) && !isDefined(restriction)
      ? getCallRecordingSummaryMarkdown(callRecording)
      : undefined;

  return (
    <>
      {isDefined(summaryMarkdown) && (
        <WidgetCardHeaderActionButton
          Icon={IconCopy}
          label={t`Copy summary`}
          onClick={() =>
            copyToClipboard(summaryMarkdown, t`Summary copied to clipboard`)
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
