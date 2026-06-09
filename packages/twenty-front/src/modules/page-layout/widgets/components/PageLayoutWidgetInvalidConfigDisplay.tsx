import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type FallbackProps } from 'react-error-boundary';
import { AppTooltip, Status } from 'twenty-ui-deprecated/display';

const StyledInvalidConfigContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export const PageLayoutWidgetInvalidConfigDisplay = ({
  error,
}: FallbackProps) => {
  const widget = useCurrentWidget();
  const tooltipId = `widget-invalid-config-tooltip-${widget.id}`;

  const text = t`Invalid Configuration`;
  const errorMessage = error instanceof Error ? error.message : String(error);
  const tooltipContent = t`Invalid configuration: ${errorMessage}`;

  return (
    <StyledInvalidConfigContainer>
      <div id={tooltipId}>
        <Status color="red" text={text} />
      </div>
      <AppTooltip
        anchorSelect={`#${tooltipId}`}
        content={tooltipContent}
        place="top"
      />
    </StyledInvalidConfigContainer>
  );
};
