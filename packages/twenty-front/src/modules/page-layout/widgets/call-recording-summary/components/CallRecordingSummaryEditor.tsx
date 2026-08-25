import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useIsCallRecordingSummaryEditable } from '@/page-layout/widgets/call-recording-summary/hooks/useIsCallRecordingSummaryEditable';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { StyledCallRecordingSummaryContainer } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryContainer';
import { lazy, Suspense } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const RichTextFieldEditor = lazy(() =>
  import('@/object-record/record-field/ui/meta-types/input/components/RichTextFieldEditor').then(
    (module) => ({ default: module.RichTextFieldEditor }),
  ),
);

type CallRecordingSummaryEditorProps = {
  callRecordingId: string;
};

export const CallRecordingSummaryEditor = ({
  callRecordingId,
}: CallRecordingSummaryEditorProps) => {
  const recordStore = useAtomFamilyStateValue(
    recordStoreFamilyState,
    callRecordingId,
  );

  const isSummaryEditable = useIsCallRecordingSummaryEditable({
    callRecordingId,
  });

  if (!isDefined(recordStore)) {
    return <WidgetSkeletonLoader />;
  }

  return (
    <StyledCallRecordingSummaryContainer>
      <Suspense fallback={<WidgetSkeletonLoader />}>
        <RichTextFieldEditor
          recordId={callRecordingId}
          objectNameSingular={CoreObjectNameSingular.CallRecording}
          fieldName="summary"
          isEditable={isSummaryEditable}
        />
      </Suspense>
    </StyledCallRecordingSummaryContainer>
  );
};
