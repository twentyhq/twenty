import { t } from '@lingui/core/macro';
import { AppTooltip, Status } from 'twenty-ui/display';
import { WidgetType } from '~/generated/graphql';

type PageLayoutWidgetNoDataDisplayProps = {
  widgetId: string;
  widgetType: WidgetType;
};

export const PageLayoutWidgetNoDataDisplay = ({
  widgetId,
  widgetType,
}: PageLayoutWidgetNoDataDisplayProps) => {
  const tooltipId = `widget-incomplete-tooltip-${widgetId}`;

  const text = widgetType === WidgetType.IFRAME ? t`Invalid URL` : t`No Data`;
  const tooltipContent =
    widgetType === WidgetType.IFRAME
      ? t`Invalid URL. Click edit to configure this widget.`
      : t`No data available. Click edit to configure this widget.`;

  return (
    <>
      <div id={tooltipId}>
        <Status color="red" text={text} />
      </div>
      <AppTooltip
        anchorSelect={`#${tooltipId}`}
        content={tooltipContent}
        place="top"
      />
    </>
  );
};
