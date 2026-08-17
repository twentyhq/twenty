import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { styled } from '@linaria/react';

const StyledForbiddenContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

type CallRecordingWidgetForbiddenDisplayProps = {
  restriction: WidgetAccessDenialInfo;
};

export const CallRecordingWidgetForbiddenDisplay = ({
  restriction,
}: CallRecordingWidgetForbiddenDisplayProps) => {
  const widget = useCurrentWidget();

  return (
    <StyledForbiddenContainer>
      <PageLayoutWidgetForbiddenDisplay
        widgetId={widget.id}
        restriction={restriction}
      />
    </StyledForbiddenContainer>
  );
};
