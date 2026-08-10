import { type CalendarEventCallRecordingWidgetState } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingWidgetState';
import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
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
  callRecordingState: CalendarEventCallRecordingWidgetState;
};

export const CallRecordingTranscriptBody = ({
  callRecordingState,
}: CallRecordingTranscriptBodyProps) => {
  const widget = useCurrentWidget();

  if (callRecordingState.state === 'LOADING') {
    return <WidgetSkeletonLoader />;
  }

  if (callRecordingState.state === 'READY') {
    return (
      <CallRecordingTranscriptEntryList entries={callRecordingState.entries} />
    );
  }

  if (callRecordingState.state === 'QUERY_ERROR') {
    return (
      <PageLayoutWidgetErrorDisplay
        widgetId={widget.id}
        error={callRecordingState.error}
      />
    );
  }

  if (callRecordingState.state === 'FORBIDDEN') {
    return (
      <StyledForbiddenContainer>
        <PageLayoutWidgetForbiddenDisplay
          widgetId={widget.id}
          restriction={callRecordingState.restriction}
        />
      </StyledForbiddenContainer>
    );
  }

  return (
    <PageLayoutWidgetMessageDisplay
      Icon={IconFileText}
      message={getCallRecordingTranscriptStateMessage(callRecordingState.state)}
    />
  );
};
