import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type FallbackProps } from 'react-error-boundary';
import { Status } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type PageLayoutWidgetInvalidConfigDisplayProps = FallbackProps;

const StyledInvalidConfigContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export const PageLayoutWidgetInvalidConfigDisplay = ({
  error,
}: PageLayoutWidgetInvalidConfigDisplayProps) => {
  const widget = useCurrentWidget();
  const tooltipId = `widget-invalid-config-tooltip-${widget.id}`;

  const text = t`Invalid Configuration`;
  const errorMessage = error instanceof Error ? error.message : String(error);
  const tooltipContent = t`Invalid configuration: ${errorMessage}`;

  return (
    <StyledInvalidConfigContainer>
      <Tooltip
        delay={TooltipDelay.mediumDelay}
        content={tooltipContent}
        side="top"
      >
        <div id={tooltipId}>
          <Status color="red">{text}</Status>
        </div>
      </Tooltip>
    </StyledInvalidConfigContainer>
  );
};
