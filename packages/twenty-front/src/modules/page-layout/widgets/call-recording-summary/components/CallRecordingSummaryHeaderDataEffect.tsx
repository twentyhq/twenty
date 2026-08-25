import { callRecordingSummaryHeaderDataComponentFamilyState } from '@/page-layout/widgets/call-recording-summary/states/callRecordingSummaryHeaderDataComponentFamilyState';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect } from 'react';

type CallRecordingSummaryHeaderDataEffectProps = {
  summaryMarkdown: string | undefined;
};

export const CallRecordingSummaryHeaderDataEffect = ({
  summaryMarkdown,
}: CallRecordingSummaryHeaderDataEffectProps) => {
  const widget = useCurrentWidget();
  const setCallRecordingSummaryHeaderData = useSetAtomComponentFamilyState(
    callRecordingSummaryHeaderDataComponentFamilyState,
    widget.id,
  );

  useEffect(() => {
    setCallRecordingSummaryHeaderData({ summaryMarkdown });
  }, [summaryMarkdown, setCallRecordingSummaryHeaderData]);

  useEffect(
    () => () => {
      setCallRecordingSummaryHeaderData(null);
    },
    [setCallRecordingSummaryHeaderData],
  );

  return null;
};
