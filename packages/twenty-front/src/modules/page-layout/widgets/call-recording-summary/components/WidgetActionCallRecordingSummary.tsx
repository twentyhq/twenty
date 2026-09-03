import { WidgetActionCallRecordingSeeAll } from '@/page-layout/widgets/call-recording/components/WidgetActionCallRecordingSeeAll';
import { useCallRecordingForWidget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForWidget';
import { getCallRecordingSummaryMarkdown } from '@/page-layout/widgets/call-recording-summary/utils/getCallRecordingSummaryMarkdown';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCopy } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const WidgetActionCallRecordingSummary = () => {
  const { callRecording, loading, error, restriction } =
    useCallRecordingForWidget({ kind: 'summary' });
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
      <WidgetActionCallRecordingSeeAll />
    </>
  );
};
