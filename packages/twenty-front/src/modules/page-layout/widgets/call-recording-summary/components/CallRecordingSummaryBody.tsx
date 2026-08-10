import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import { type CalendarEventCallRecordingSummaryWidgetState } from '@/page-layout/widgets/call-recording-summary/types/CalendarEventCallRecordingSummaryWidgetState';
import { getCallRecordingSummaryStateMessage } from '@/page-layout/widgets/call-recording-summary/utils/getCallRecordingSummaryStateMessage';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { PageLayoutWidgetMessageDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetMessageDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { styled } from '@linaria/react';
import { IconFileText } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledForbiddenContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledCopyButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

type CallRecordingSummaryBodyProps = {
  callRecordingSummaryState: CalendarEventCallRecordingSummaryWidgetState;
};

export const CallRecordingSummaryBody = ({
  callRecordingSummaryState,
}: CallRecordingSummaryBodyProps) => {
  const widget = useCurrentWidget();

  if (callRecordingSummaryState.state === 'LOADING') {
    return <WidgetSkeletonLoader />;
  }

  if (callRecordingSummaryState.state === 'READY') {
    return (
      <StyledSummaryContainer>
        <StyledCopyButtonRow>
          <LightCopyIconButton copyText={callRecordingSummaryState.markdown} />
        </StyledCopyButtonRow>
        <LazyMarkdownRenderer text={callRecordingSummaryState.markdown} />
      </StyledSummaryContainer>
    );
  }

  if (callRecordingSummaryState.state === 'QUERY_ERROR') {
    return (
      <PageLayoutWidgetErrorDisplay
        widgetId={widget.id}
        error={callRecordingSummaryState.error}
      />
    );
  }

  if (callRecordingSummaryState.state === 'FORBIDDEN') {
    return (
      <StyledForbiddenContainer>
        <PageLayoutWidgetForbiddenDisplay
          widgetId={widget.id}
          restriction={callRecordingSummaryState.restriction}
        />
      </StyledForbiddenContainer>
    );
  }

  return (
    <PageLayoutWidgetMessageDisplay
      Icon={IconFileText}
      message={getCallRecordingSummaryStateMessage(
        callRecordingSummaryState.state,
      )}
    />
  );
};
