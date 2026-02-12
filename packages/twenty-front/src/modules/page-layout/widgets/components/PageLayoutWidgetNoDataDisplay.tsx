import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { AppTooltip, Status } from 'twenty-ui/display';
import { WidgetType } from '~/generated-metadata/graphql';

const StyledNoDataContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;
export const PageLayoutWidgetNoDataDisplay = () => {
  const widget = useCurrentWidget();
  const tooltipId = `widget-incomplete-tooltip-${widget.id}`;

  const text = widget.type === WidgetType.IFRAME ? t`Invalid URL` : t`No Data`;
  const tooltipContent =
    widget.type === WidgetType.IFRAME
      ? t`Invalid URL. Click edit to configure this widget.`
      : t`No data available. Click edit to configure this widget.`;

  return (
    <StyledNoDataContainer>
      <div id={tooltipId}>
        <Status color="red" text={text} />
      </div>
      <AppTooltip
        anchorSelect={`#${tooltipId}`}
        content={tooltipContent}
        place="top"
      />
    </StyledNoDataContainer>
  );
};
