import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { AppTooltip, Status } from 'twenty-ui/display';

const StyledInvalidConfigContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export const PageLayoutWidgetInvalidConfigDisplay = () => {
  const widget = useCurrentWidget();
  const tooltipId = `widget-invalid-config-tooltip-${widget.id}`;

  const text = t`Invalid Configuration`;
  const tooltipContent = t`Invalid configuration. Click edit to configure this widget.`;

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
