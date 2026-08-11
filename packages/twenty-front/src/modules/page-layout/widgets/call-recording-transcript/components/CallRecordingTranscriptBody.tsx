import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { type CalendarEventCallRecordingTranscriptWidgetState } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptWidgetState';
import { getCallRecordingTranscriptStateMessage } from '@/page-layout/widgets/call-recording-transcript/utils/getCallRecordingTranscriptStateMessage';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { PageLayoutWidgetMessageDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetMessageDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { styled } from '@linaria/react';
import { IconFileText } from 'twenty-ui/icon';

const StyledForbiddenContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

type CallRecordingTranscriptBodyProps = {
  callRecordingTranscriptState: CalendarEventCallRecordingTranscriptWidgetState;
};

export const CallRecordingTranscriptBody = ({
  callRecordingTranscriptState,
}: CallRecordingTranscriptBodyProps) => {
  const widget = useCurrentWidget();

  if (callRecordingTranscriptState.state === 'LOADING') {
    return <WidgetSkeletonLoader />;
  }

  if (callRecordingTranscriptState.state === 'READY') {
    return (
      <CallRecordingTranscriptEntryList
        entries={callRecordingTranscriptState.entries}
      />
    );
  }

  if (callRecordingTranscriptState.state === 'QUERY_ERROR') {
    return (
      <PageLayoutWidgetErrorDisplay
        widgetId={widget.id}
        error={callRecordingTranscriptState.error}
      />
    );
  }

  if (callRecordingTranscriptState.state === 'FORBIDDEN') {
    return (
      <StyledForbiddenContainer>
        <PageLayoutWidgetForbiddenDisplay
          widgetId={widget.id}
          restriction={callRecordingTranscriptState.restriction}
        />
      </StyledForbiddenContainer>
    );
  }

  return (
    <PageLayoutWidgetMessageDisplay
      Icon={IconFileText}
      message={getCallRecordingTranscriptStateMessage(
        callRecordingTranscriptState.state,
      )}
    />
  );
};
